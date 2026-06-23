import express from "express";
import cors from "cors";
import { WebSocketServer } from "ws";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Relay listening on ${PORT}`);
});

const wss = new WebSocketServer({ server });
const clients = new Set();

wss.on("connection", ws => {
    clients.add(ws);

    ws.on("close", () => {
        clients.delete(ws);
    });
});

function broadcast(message) {
    const payload = JSON.stringify(message);

    for (const client of clients) {
        if (client.readyState === 1) {
            client.send(payload);
        }
    }
}

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.post("/webhook/azure", (req, res) => {
    const body = req.body;

    const eventType =
        body.eventType ||
        body.eventTypeName ||
        body.eventTypeDetailed ||
        "unknown";

    const notification = {
        receivedAt: new Date().toISOString(),
        eventType,
        payload: body
    };

    console.log(`[${notification.receivedAt}] ${eventType}`);

    broadcast(notification);

    res.sendStatus(200);
});

app.post("/test", (req, res) => {

    broadcast({
        eventType: "ms.vss-code.git-pullrequest-comment-event",
        payload: {
            title: "Feature/Login",
            author: "Jean Dupont",
            comment: "Peux-tu vérifier ce point ?"
        }
    });

    res.sendStatus(200);
});