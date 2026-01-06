import MobileLayout from "@/components/mobile-layout";
import { getTasks, getCrops, updateTaskStatus, deleteTask } from "../actions";
import { Card, CardContent } from "@/components/ui/card";
import {
    CheckCircle2,
    Circle,
    Calendar,
    Tag,
    AlertCircle,
    Clock,
    Trash2,
    Plus,
    Hammer,
    Sprout,
    Zap,
    ArrowRight
} from "lucide-react";
import TaskForm from "@/components/task-form";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
    const tasks = await getTasks();
    const crops = await getCrops();

    const pendingTasks = tasks.filter(t => t.status === 'Pending');
    const completedTasks = tasks.filter(t => t.status === 'Done');

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
            case 'Low': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Garden': return <Sprout className="h-3 w-3" />;
            case 'Infrastructure': return <Hammer className="h-3 w-3" />;
            default: return <Zap className="h-3 w-3" />;
        }
    };

    return (
        <MobileLayout>
            <div className="space-y-6 pb-24 bg-black min-h-screen">
                <header className="flex justify-between items-end px-1">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight font-serif">Tareas</h1>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Planificación y Mantenimiento</p>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            {pendingTasks.length} PENDIENTES
                        </span>
                    </div>
                </header>

                <TaskForm crops={crops} />

                {/* Pending Tasks Section */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            A Realizar
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {pendingTasks.length === 0 ? (
                            <div className="py-12 text-center bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-800">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500/20 mx-auto mb-2" />
                                <p className="text-slate-500 text-xs font-bold">¡Todo al día en La Finquina!</p>
                            </div>
                        ) : (
                            pendingTasks.map((task) => (
                                <Card key={task.id} className="border-none shadow-xl overflow-hidden bg-slate-900 group">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            <form action={async () => {
                                                'use server'
                                                await updateTaskStatus(task.id, 'Done');
                                            }} className="pt-1">
                                                <button className="text-slate-700 hover:text-emerald-500 transition-colors">
                                                    <Circle className="h-6 w-6" />
                                                </button>
                                            </form>

                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-slate-100 text-sm leading-tight">{task.title}</h3>
                                                        {task.description && (
                                                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{task.description}</p>
                                                        )}
                                                    </div>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${getPriorityStyles(task.priority || 'Normal')}`}>
                                                        {task.priority || 'Normal'}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                                                        {getCategoryIcon(task.category)}
                                                        {task.category}
                                                    </span>
                                                    {task.dueDate && (
                                                        <span className="text-[9px] text-amber-500 flex items-center gap-1 font-bold">
                                                            <Calendar className="h-2.5 w-2.5" />
                                                            {new Date(task.dueDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {task.crop && (
                                                        <span className="text-[9px] text-emerald-500 flex items-center gap-1 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                                                            <Sprout className="h-2.5 w-2.5" />
                                                            {task.crop.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </section>

                {/* Completed Tasks Section */}
                {completedTasks.length > 0 && (
                    <section className="space-y-4 pt-4 opacity-60">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                            Completadas
                        </h2>
                        <div className="space-y-2">
                            {completedTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800/50">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        <span className="text-sm line-through text-slate-500 font-medium">{task.title}</span>
                                    </div>
                                    <form action={async () => {
                                        'use server'
                                        await deleteTask(task.id);
                                    }}>
                                        <button className="p-2 text-slate-700 hover:text-red-500 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </MobileLayout>
    );
}
