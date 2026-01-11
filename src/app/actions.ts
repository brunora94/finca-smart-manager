'use server'

import prisma from "@/lib/prisma";
import { getCurrentWeather } from "@/lib/weather";
import { getAiDailyAdvice } from "@/lib/ai";
import { getLunarInfo } from "@/lib/lunar";
import { getRotationType, getNextInRotation, getCategoryDescription } from "@/lib/agriculture";
import { runWithResilience } from "@/lib/ai";

export async function getDashboardStats() {
    // 1. Calculations that DON'T need DB (Always available)
    const lunarInfo = getLunarInfo();
    let weatherData: any = null;
    try {
        weatherData = await getCurrentWeather();
    } catch (e) {
        console.error("Weather fetch failed:", e);
    }

    // 2. Default values for DB-dependent stats
    let stats = {
        activeCrops: 0,
        pendingTasks: 0,
        urgentTasks: 0,
        monthlySpending: 0,
        aiAdvice: "Buscando consejos...",
        farmHealthScore: 0,
        lunarInfo,
        resourceAlerts: [] as any[],
        agronomicAlerts: [] as any[]
    };

    try {
        const activeCropsCount = await prisma.crop.count({
            where: { status: 'Planted' }
        })

        const pendingTasksCount = await prisma.task.count({
            where: { status: 'Pending' }
        })

        const urgentTasksCount = await prisma.task.count({
            where: {
                status: 'Pending',
                priority: 'High'
            }
        })

        // Gasto mensual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthlyExpenses = await prisma.expense.findMany({
            where: {
                date: {
                    gte: startOfMonth
                }
            }
        })

        const monthlySpending = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0)

        // Farm Health Score (0-100)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const completedTasks = await prisma.task.count({ where: { status: 'Done', dueDate: { gte: thirtyDaysAgo } } })
        const totalTasks = await prisma.task.count({ where: { dueDate: { gte: thirtyDaysAgo } } })

        const taskScore = totalTasks > 0 ? (completedTasks / totalTasks) * 50 : 50;

        const recentLogs = await prisma.cropLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: { aiAnalysis: true, cropId: true }
        })

        const healthValues = recentLogs.map(l => {
            if (l.aiAnalysis?.includes('Bueno')) return 50;
            if (l.aiAnalysis?.includes('Regular')) return 25;
            if (l.aiAnalysis?.includes('Malo')) return 10;
            return 30;
        })
        const healthScore = healthValues.length > 0 ? (healthValues.reduce((a, b) => a + b, 0) / (healthValues.length * 50)) * 50 : 25;

        const farmHealthScore = Math.round(taskScore + healthScore);

        // IA Advice
        let aiAdvice = "";
        try {
            const activeCrops = await prisma.crop.findMany({ where: { status: 'Planted' }, take: 5 })
            const pendingTasks = await prisma.task.findMany({ where: { status: 'Pending' }, take: 5 })

            aiAdvice = await getAiDailyAdvice({
                weather: weatherData,
                activeCrops,
                pendingTasks,
                monthlySpending
            })
        } catch (e) {
            console.error("Dashboard AI Advice failed:", e);
            aiAdvice = "El asesor está offline ahora mismo.";
        }

        // Resource Alerts
        let resourceAlerts: any[] = [];
        try {
            const allResources = await (prisma as any).resource.findMany();
            resourceAlerts = allResources.filter((r: any) => r.quantity <= r.minStock);
        } catch (e) {
            console.error("Failed to fetch resources for stats:", e);
        }

        // Agronomic Alerts
        let agronomicAlerts: any[] = [];
        try {
            agronomicAlerts = recentLogs
                .filter(l => l.aiAnalysis?.includes('💡'))
                .map(l => {
                    const tips = l.aiAnalysis?.split('💡 Consejos Agronómicos: ')[1]?.split('\n')[0] || '';
                    return {
                        cropId: l.cropId,
                        tips: tips.split('. ').filter(t => t.length > 5).slice(0, 2)
                    }
                })
                .filter(a => a.tips.length > 0)
                .slice(0, 3);
        } catch (e) {
            console.error("Failed to parse agronomic alerts:", e);
        }

        return {
            ...stats,
            activeCrops: activeCropsCount,
            pendingTasks: pendingTasksCount,
            urgentTasks: urgentTasksCount,
            monthlySpending,
            aiAdvice: aiAdvice || "Sin consejos hoy.",
            farmHealthScore,
            resourceAlerts: resourceAlerts.map((r: any) => ({ name: r.name, quantity: r.quantity, unit: r.unit })),
            agronomicAlerts
        }
    } catch (e: any) {
        console.error("DB Error in getDashboardStats:", e.message);
        // Returns the pre-calculated Lunar/Weather + Error message in advice
        return {
            ...stats,
            aiAdvice: `Error BD: ${e.message?.substring(0, 50)}... (El clima y la luna siguen operativos 🌕)`
        }
    }
}

export async function getUrgentTasks() {
    try {
        return await prisma.task.findMany({
            where: {
                status: 'Pending',
                // Prioridad alta o vencidas hoy/antes
                OR: [
                    { priority: 'High' },
                    { dueDate: { lte: new Date() } }
                ]
            },
            take: 5,
            orderBy: { dueDate: 'asc' }
        })
    } catch (e) {
        console.error("Failed to fetch urgent tasks:", e);
        return [];
    }
}

import { analyzeCropImage, translateToEnglish, translateToSpanish, analyzeCropNote } from '@/lib/ai'
import { revalidatePath } from 'next/cache'
import { searchPlants } from "@/lib/perenual"

export async function searchPlantSpecies(query: string) {
    if (!query || query.length < 2) return [];

    try {
        // 1. Translate query to English for API
        const englishQuery = await translateToEnglish(query);

        // 2. Search in Perenual
        let results = await searchPlants(englishQuery);

        // If no results, try original query just in case
        if (results.length === 0 && englishQuery !== query) {
            results = await searchPlants(query);
        }

        // 3. Translate top 5 results back to Spanish for the user
        const translatedResults = await Promise.all(results.slice(0, 8).map(async (p) => {
            const spanishName = await translateToSpanish(p.common_name);
            return {
                ...p,
                common_name: spanishName || p.common_name // Fallback to original
            };
        }));

        return translatedResults;
    } catch (error) {
        console.error("Search failed:", error);
        return [];
    }
}

export async function createJournalEntry(formData: FormData) {
    const note = formData.get('note') as string
    const imagePath = formData.get('imagePath') as string

    if (!imagePath) throw new Error("Image required for AI analysis");

    // fs logging removed for Vercel

    // 1. Analyze with AI
    const analysis = await analyzeCropImage(imagePath, note);

    // logging removed for Vercel

    let aiAnalysisText = null;

    if (analysis) {
        aiAnalysisText = `[${analysis.identification}] Salud: ${analysis.health}. ${analysis.diagnosis}. Consejo: ${analysis.advice}`;

        // 3. Create Suggested Tasks
        if (analysis.suggestedTasks && Array.isArray(analysis.suggestedTasks)) {
            for (const taskTitle of analysis.suggestedTasks) {
                await prisma.task.create({
                    data: {
                        title: taskTitle,
                        description: `Sugerido por IA para ${analysis.identification}`,
                        status: 'Pending',
                        category: 'Garden',
                        priority: analysis.health !== 'Bueno' ? 'High' : 'Normal'
                    }
                })
            }
        }
    } else if (analysis && (analysis as any).error) {
        // Handle error case
        aiAnalysisText = `⚠️ Error IA: ${(analysis as any).error.includes('quota') ? 'Cuota Excedida (Revisa Billing en OpenAI)' : 'Error de conexión'}`;
    }

    // Find a fallback crop ID
    const firstCrop = await prisma.crop.findFirst();
    const cropId = firstCrop ? firstCrop.id : 1;

    await prisma.cropLog.create({
        data: {
            cropId: cropId,
            note: note,
            imageUrl: imagePath,
            aiAnalysis: aiAnalysisText
        }
    })

    revalidatePath('/');
    return { success: true, analysis }
}

export async function getRecentLogs() {
    try {
        return await prisma.cropLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }, // Changed to createdAt for more consistent activity feed
            include: { crop: true }
        })
    } catch (e) {
        console.error("Failed to fetch recent logs:", e);
        return [];
    }
}

export async function getAllLogs() {
    return await prisma.cropLog.findMany({
        orderBy: { date: 'desc' },
        include: { crop: true }
    })
}

import { del } from '@vercel/blob';

export async function deleteLog(logId: number) {
    const log = await prisma.cropLog.findUnique({
        where: { id: logId }
    })

    if (log?.imageUrl && log.imageUrl.startsWith('http')) {
        try {
            await del(log.imageUrl);
        } catch (e) {
            console.error("Failed to delete blob:", e);
        }
    }

    await prisma.cropLog.delete({
        where: { id: logId }
    })

    revalidatePath('/')
    revalidatePath('/journal')
    return { success: true }
}

// Expenses
export async function getExpenses() {
    return await prisma.expense.findMany({
        orderBy: { date: 'desc' }
    })
}

export async function addExpense(formData: FormData) {
    const item = formData.get('item') as string
    const amount = parseFloat(formData.get('amount') as string)
    const category = formData.get('category') as string
    const dateStr = formData.get('date') as string
    const shop = formData.get('shop') as string

    if (!item || isNaN(amount)) return { error: "Item y cantidad son requeridos" }

    await prisma.expense.create({
        data: {
            item,
            amount,
            category: category || "Otros",
            date: dateStr ? new Date(dateStr) : new Date(),
            shop
        }
    })

    revalidatePath('/expenses')
    revalidatePath('/')
    return { success: true }
}

export async function deleteExpense(id: number) {
    await prisma.expense.delete({
        where: { id }
    })
    revalidatePath('/expenses')
    revalidatePath('/')
    return { success: true }
}

// Crops
export async function getCrops() {
    return await prisma.crop.findMany({
        orderBy: { plantedAt: 'desc' }
    })
}

export async function addCrop(formData: FormData) {
    const name = formData.get('name') as string
    const variety = formData.get('variety') as string
    const location = formData.get('location') as string
    const bed = formData.get('bed') as string
    const row = formData.get('row') as string
    const imageUrl = formData.get('imageUrl') as string
    const lat = parseFloat(formData.get('latitude') as string)
    const lng = parseFloat(formData.get('longitude') as string)
    const notes = formData.get('notes') as string

    if (!name) return { error: "El nombre es requerido" }

    const cropData: any = {
        name,
        variety,
        location,
        bed,
        row,
        imageUrl,
        status: 'Planted',
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
        notes
    };

    await (prisma.crop as any).create({
        data: cropData
    })

    revalidatePath('/crops')
    revalidatePath('/map')
    revalidatePath('/')
    return { success: true }
}

export async function getCropById(id: number) {
    if (isNaN(id)) return null;
    return await prisma.crop.findUnique({
        where: { id },
        include: {
            logs: { orderBy: { date: 'desc' } }
        }
    })
}

export async function logCropProgress(cropId: number, imageUrl: string, userNote: string) {
    // 0. Get Crop context
    const crop = await prisma.crop.findUnique({
        where: { id: cropId }
    });

    if (!crop) return { error: "Crop not found" };

    // Find neighbors in same bed/row
    const neighbors = await (prisma.crop as any).findMany({
        where: {
            bed: (crop as any).bed,
            row: (crop as any).row,
            id: { not: cropId },
            status: 'Planted'
        }
    });

    const context = {
        name: crop.name,
        variety: crop.variety,
        bed: (crop as any).bed,
        row: (crop as any).row,
        plantedAt: crop.plantedAt,
        neighbors: neighbors.map((n: any) => n.name + (n.variety ? ` (${n.variety})` : ''))
    };

    // 1. Analyze with AI
    let analysis;
    if (imageUrl) {
        analysis = await (analyzeCropImage as any)(imageUrl, userNote, context);
    } else {
        analysis = await analyzeCropNote(userNote, context);
    }

    // 2. Register in DB
    const compatibilityInfo = analysis.compatibility ? `\n\n🧩 Compatibilidad: ${analysis.compatibility}` : '';
    const harvestInfo = analysis.harvestEstimation ? `\n\n📆 Cosecha estimada: ${analysis.harvestEstimation}` : '';
    const agronomicTips = analysis.agronomicTips?.length > 0 ? `\n\n💡 Consejos Agronómicos: ${analysis.agronomicTips.join('. ')}` : '';

    await prisma.cropLog.create({
        data: {
            cropId,
            imageUrl: imageUrl || null,
            note: userNote,
            aiAnalysis: analysis.error ? "Error en análisis" : `${analysis.diagnosis || analysis.advice}${compatibilityInfo}${harvestInfo}${agronomicTips}\n\nSalud: ${analysis.health}`,
            date: new Date()
        }
    })

    revalidatePath(`/crops/${cropId}`)
    revalidatePath('/journal')
    return { success: true, analysis }
}

export async function getResources() {
    try {
        return await prisma.resource.findMany({
            orderBy: { name: 'asc' }
        });
    } catch (e) {
        console.error("Failed to get resources:", e);
        return [];
    }
}

export async function addResource(formData: FormData) {
    try {
        const name = formData.get('name') as string;
        const category = formData.get('category') as string;
        const quantity = parseFloat(formData.get('quantity') as string);
        const unit = formData.get('unit') as string;
        const minStock = parseFloat(formData.get('minStock') as string) || 0;
        const cost = parseFloat(formData.get('cost') as string) || 0;

        await prisma.resource.create({
            data: { name, category, quantity, unit, minStock }
        });

        if (cost > 0) {
            await prisma.expense.create({
                data: {
                    item: `Compra recurso: ${name}`,
                    amount: cost,
                    category: category === 'Seeds' ? 'Semillas' : category === 'Fertilizer' ? 'Abono' : 'Herramientas',
                    date: new Date(),
                    shop: 'Inventario'
                }
            });
        }

        revalidatePath('/inventory');
        revalidatePath('/analytics'); // Refresh analytics
    } catch (e) {
        console.error("Failed to add resource:", e);
    }
}

export async function updateResourceQuantity(id: number, delta: number, cost: number = 0) {
    try {
        const resource = await prisma.resource.findUnique({
            where: { id }
        });
        if (!resource) return;

        await prisma.resource.update({
            where: { id },
            data: { quantity: Math.max(0, resource.quantity + delta) }
        });

        // If increasing stock and cost is provided
        if (delta > 0 && cost > 0) {
            await prisma.expense.create({
                data: {
                    item: `Reposición: ${resource.name}`,
                    amount: cost,
                    category: 'Mantenimiento',
                    date: new Date(),
                    shop: 'Inventario'
                }
            });
        }

        revalidatePath('/inventory');
        revalidatePath('/analytics');
        revalidatePath('/'); // For alerts
    } catch (e) {
        console.error("Failed to update resource quantity:", e);
    }
}

export async function deleteResource(id: number) {
    try {
        await prisma.resource.delete({
            where: { id }
        });
        revalidatePath('/inventory');
    } catch (e) {
        console.error("Failed to delete resource:", e);
    }
}

export async function updateCropStatus(id: number, status: string) {
    await prisma.crop.update({
        where: { id },
        data: { status }
    })
    revalidatePath('/crops')
    revalidatePath('/')
    return { success: true }
}

export async function deleteCrop(id: number) {
    // Delete related logs and tasks first if necessary, but Prisma might handle it if defined with cascade
    // For now simple delete
    await prisma.crop.delete({
        where: { id }
    })
    revalidatePath('/crops')
    revalidatePath('/map')
    revalidatePath('/')
    return { success: true }
}

// Trees
export async function getTrees() {
    return await prisma.tree.findMany()
}

export async function addTree(formData: FormData) {
    const name = formData.get('name') as string
    const plantedYear = parseInt(formData.get('plantedYear') as string)
    const location = formData.get('location') as string
    const lat = parseFloat(formData.get('latitude') as string)
    const lng = parseFloat(formData.get('longitude') as string)
    const health = formData.get('health') as string
    const notes = formData.get('notes') as string

    if (!name) return { error: "El nombre es requerido" }

    await (prisma.tree as any).create({
        data: {
            name,
            plantedYear: isNaN(plantedYear) ? null : plantedYear,
            location,
            latitude: isNaN(lat) ? null : lat,
            longitude: isNaN(lng) ? null : lng,
            health: health || 'Sano',
            notes
        }
    })

    revalidatePath('/crops') // Both share the same management page for now
    revalidatePath('/map')
    revalidatePath('/')
    return { success: true }
}

export async function deleteTree(id: number) {
    await prisma.tree.delete({
        where: { id }
    })
    revalidatePath('/crops')
    revalidatePath('/map')
    revalidatePath('/')
    return { success: true }
}

export async function updateCrop(id: number, formData: FormData) {
    const name = formData.get('name') as string
    const variety = formData.get('variety') as string
    const location = formData.get('location') as string
    const bed = formData.get('bed') as string
    const row = formData.get('row') as string
    const plantedAtStr = formData.get('plantedAt') as string
    const notes = formData.get('notes') as string
    const lat = parseFloat(formData.get('latitude') as string)
    const lng = parseFloat(formData.get('longitude') as string)

    const updateData: any = {
        name,
        variety,
        location,
        bed,
        row,
        plantedAt: plantedAtStr ? new Date(plantedAtStr) : undefined,
        notes,
        latitude: isNaN(lat) ? null : lat,
        longitude: isNaN(lng) ? null : lng,
    };

    await (prisma.crop as any).update({
        where: { id },
        data: updateData
    })

    revalidatePath(`/crops/${id}`)
    revalidatePath('/crops')
    return { success: true }
}

// Tasks
export async function getTasks() {
    return await prisma.task.findMany({
        orderBy: [
            { status: 'desc' }, // Pending (P) comes after Done (D), so desc puts Pending first
            { dueDate: 'asc' }
        ],
        include: { crop: true }
    })
}

export async function addTask(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string || 'Garden'
    const priority = formData.get('priority') as string || 'Normal'
    const dueDateStr = formData.get('dueDate') as string
    const cropIdStr = formData.get('cropId') as string

    if (!title) return { error: "El título es requerido" }

    await prisma.task.create({
        data: {
            title,
            description,
            category,
            priority,
            status: 'Pending',
            dueDate: dueDateStr ? new Date(dueDateStr) : null,
            cropId: cropIdStr ? parseInt(cropIdStr) : null
        }
    })

    revalidatePath('/tasks')
    revalidatePath('/')
    return { success: true }
}

export async function updateTaskStatus(id: number, status: 'Pending' | 'Done') {
    await prisma.task.update({
        where: { id },
        data: { status }
    })
    revalidatePath('/tasks')
    revalidatePath('/')
    return { success: true }
}

export async function deleteTask(id: number) {
    await prisma.task.delete({
        where: { id }
    })
    revalidatePath('/tasks')
    revalidatePath('/')
    return { success: true }
}

export async function getMakerModels() {
    try {
        return await (prisma as any).makerModel.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (e) {
        console.error("Failed to get maker models:", e);
        return [];
    }
}

export async function addMakerModel(formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const description = formData.get('description') as string;
        const fileUrl = formData.get('fileUrl') as string;

        await (prisma as any).makerModel.create({
            data: { title, category, description, fileUrl }
        });

        revalidatePath('/maker');
    } catch (e) {
        console.error("Failed to add maker model:", e);
    }
}

export async function globalSearch(query: string) {
    if (!query || query.length < 2) return { crops: [], trees: [], resources: [], tasks: [] };

    const [crops, trees, resources, tasks] = await Promise.all([
        prisma.crop.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { variety: { contains: query } },
                    { bed: { contains: query } },
                    { notes: { contains: query } }
                ]
            },
            take: 10
        }),
        prisma.tree.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { notes: { contains: query } }
                ]
            },
            take: 10
        }),
        prisma.resource.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { category: { contains: query } }
                ]
            },
            take: 10
        }),
        prisma.task.findMany({
            where: {
                OR: [
                    { title: { contains: query } },
                    { description: { contains: query } }
                ]
            },
            take: 10,
            include: { crop: true }
        })
    ]);

    return { crops, trees, resources, tasks };
}

export async function getExpenseAnalytics() {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' }
        });

        const byCategory: Record<string, number> = {};
        expenses.forEach(e => {
            byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
        });

        const byMonth: Record<string, number> = {};
        expenses.forEach(e => {
            const month = e.date.toISOString().substring(0, 7);
            byMonth[month] = (byMonth[month] || 0) + e.amount;
        });

        const now = new Date();
        const currentMonthStr = now.toISOString().substring(0, 7);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = lastMonth.toISOString().substring(0, 7);

        const currentMonthTotal = byMonth[currentMonthStr] || 0;
        const lastMonthTotal = byMonth[lastMonthStr] || 0;

        return {
            byCategory: Object.entries(byCategory).map(([name, value]) => ({ name, value })),
            byMonth: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month)),
            currentMonthTotal,
            lastMonthTotal,
            totalInvoiced: expenses.reduce((sum, e) => sum + e.amount, 0)
        };
    } catch (e) {
        console.error("Failed to fetch expense analytics:", e);
        // Fail gracefully for build-time safety
        return {
            byCategory: [],
            byMonth: [],
            currentMonthTotal: 0,
            lastMonthTotal: 0,
            totalInvoiced: 0
        };
    }
}

export async function getRotationAdvice(cropId: number) {
    const crop = await prisma.crop.findUnique({ where: { id: cropId } });
    if (!crop || !crop.bed) return null;

    const history = await prisma.crop.findMany({
        where: { bed: crop.bed, id: { not: cropId } },
        orderBy: { plantedAt: 'desc' },
        take: 3
    });

    const currentType = getRotationType(crop.name);
    const nextType = getNextInRotation(currentType);

    const prompt = `
        Analiza el historial de cultivo para el bancal "${crop.bed}" en Asturias.
        Cultivo actual: ${crop.name} (Tipo: ${currentType}).
        Historial reciente: ${history.map(h => h.name).join(', ') || 'Sin registro anterior'}.
        
        Basado en la rotación científica HOJA -> FRUTO -> RAIZ -> LEGUMINOSA, recomienda el próximo cultivo ideal.
        Dime qué plantar después del cultivo actual, justifica por qué y sugiere 2 variedades locales de Asturias.
        
        Responde brevemente en formato JSON:
        {
            "recommendedCategory": "Tipo recomendado",
            "justification": "Breve explicación técnica",
            "suggestedVarieties": ["Variedad 1", "Variedad 2"],
            "urgency": "Alta | Media | Baja"
        }
    `;

    try {
        const result = await runWithResilience((model) => model.generateContent(prompt));
        const jsonText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonText);
    } catch (e) {
        console.error("Rotation AI failed:", e);
        return {
            recommendedCategory: nextType,
            justification: `Siguiendo la rotación científica estándar: ${getCategoryDescription(nextType)}`,
            suggestedVarieties: ["Habas Asturianas", "Pimientos de Padrón"],
            urgency: "Media"
        }
    }
}

export async function exportFincaData() {
    try {
        const crops = await prisma.crop.findMany({
            include: { logs: true }
        });

        let csv = "\uFEFFID,Nombre,Variedad,Estado,Bancal,Fila,Fecha Plantacion,Ultima Nota,Ultimo Informe IA\n";
        crops.forEach(c => {
            const logsSorted = [...c.logs].sort((a, b) => b.date.getTime() - a.date.getTime());
            const lastLog = logsSorted[0];
            const aiInfo = lastLog?.aiAnalysis?.replace(/[,\n]/g, " ") || "";
            const note = lastLog?.note?.replace(/[,\n]/g, " ") || "";
            csv += `${c.id},"${c.name}","${c.variety || ''}","${c.status}","${(c as any).bed || ''}","${(c as any).row || ''}",${c.plantedAt.toLocaleDateString() || ''},"${note}","${aiInfo}"\n`;
        });

        return csv;
    } catch (e) {
        console.error("Export failed:", e);
        return "Error en exportación";
    }
}

export async function exportExpensesData() {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: { sort: 'desc' } as any }
        });
        let csv = "\uFEFFID,Articulo,Cantidad,Categoria,Tienda,Fecha\n";
        expenses.forEach(e => {
            csv += `${e.id},"${e.item}",${e.amount},"${e.category}","${e.shop || ''}",${e.date.toLocaleDateString()}\n`;
        });
        return csv;
    } catch (e) {
        console.error("Export expenses failed:", e);
        return "Error en exportación";
    }
}

export async function getNotifications() {
    const notifications: any[] = [];

    try {
        // 1. Stock
        const resources = await prisma.resource.findMany();
        resources.filter(r => r.quantity <= r.minStock).forEach(r => {
            notifications.push({
                id: `stock-${r.id}`,
                type: 'warning',
                title: 'Almacén',
                message: `Quedan ${r.quantity} ${r.unit} de ${r.name}`,
                category: 'Inventory'
            });
        });

        // 2. Tasks
        const urgentTasks = await prisma.task.findMany({
            where: { status: 'Pending', priority: 'High' },
            take: 3
        });
        urgentTasks.forEach(t => {
            notifications.push({
                id: `task-${t.id}`,
                type: 'info',
                title: 'Urgente',
                message: t.title,
                category: 'Tasks'
            });
        });

        // 4. AI Agronomy (v1.8)
        const recentLogs = await prisma.cropLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { crop: true }
        });

        recentLogs
            .filter(l => l.aiAnalysis?.includes('💡'))
            .forEach(l => {
                const tips = l.aiAnalysis?.split('💡 Consejos Agronómicos: ')[1]?.split('\n')[0] || '';
                const firstTip = tips.split('. ')[0];
                if (firstTip) {
                    notifications.push({
                        id: `agro-${l.id}`,
                        type: 'alert',
                        title: `IA: ${l.crop.name}`,
                        message: firstTip,
                        category: 'Agronomy'
                    });
                }
            });

        // 3. Weather
        const weather = await getCurrentWeather();
        if (weather?.alerts) {
            weather.alerts.forEach((alert: any) => {
                notifications.push({
                    id: `weather-${alert.type}`,
                    type: 'alert',
                    title: 'Clima',
                    message: alert.message,
                    category: 'Weather'
                });
            });
        }
    } catch (e) {
        console.error("Notifications error:", e);
    }

    return notifications;
}
