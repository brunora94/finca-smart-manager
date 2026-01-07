export default function TestHealthPage() {
    return (
        <div style={{ padding: '50px', backgroundColor: 'white', color: 'black' }}>
            <h1>System Status: ONLINE</h1>
            <p>If you see this, the Next.js app is running correctly on Vercel.</p>
            <p>Time: {new Date().toISOString()}</p>
        </div>
    )
}
