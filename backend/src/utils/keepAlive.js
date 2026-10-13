/**
 * Keep-Alive Service
 * Sends an HTTP GET request to the backend every 10 minutes to prevent
 * free-tier servers (Render, Railway, etc.) from sleeping.
 */

export const startKeepAlive = () => {
    // Render sets RENDER_EXTERNAL_URL automatically (e.g., https://yourapp.onrender.com)
    // Or specify SERVER_URL in your .env file
    const url = process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL;

    if (!url) {
        console.log("ℹ️  Keep-Alive: No SERVER_URL or RENDER_EXTERNAL_URL set in env. Internal auto-ping disabled.");
        return;
    }

    const targetUrl = url.endsWith('/') ? `${url}ping` : `${url}/ping`;
    const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

    console.log(`💓 Keep-Alive service started: Pinging ${targetUrl} every 10 minutes.`);

    // Run first ping after interval
    const intervalId = setInterval(async () => {
        try {
            const res = await fetch(targetUrl);
            console.log(`[${new Date().toLocaleTimeString()}] 💓 Keep-Alive ping sent to ${targetUrl} (Status: ${res.status})`);
        } catch (error) {
            console.error(`[${new Date().toLocaleTimeString()}] ⚠️ Keep-Alive ping error:`, error.message);
        }
    }, INTERVAL_MS);

    // Ensure interval doesn't prevent process from exiting gracefully if needed
    if (intervalId.unref) {
        intervalId.unref();
    }
};
