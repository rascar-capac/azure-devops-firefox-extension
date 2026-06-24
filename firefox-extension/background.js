let socket;
const relayUrl = "ws://localhost:3000";

async function getNotifications() {

    const result = await browser.storage.local.get("notifications");

    return result.notifications ?? [];
}

async function updateNotificationList(notifications) {

    await browser.storage.local.set({ notifications });

    updateBadge(notifications.length);
}

function updateBadge(count) {

    browser.action.setBadgeText({ text: count > 0 ? count.toString() : "" });
    browser.action.setBadgeBackgroundColor({ color: "#ff0000" });
}

async function addNotification(notification) {

    const notifications = await getNotifications();

    notifications.unshift(notification);

    await updateNotificationList(notifications);

    browser.notifications.create({
        title: notification.title,
        message: notification.description
    });
}

async function removeNotification(id) {

    const notifications = await getNotifications();

    const filtered = notifications.filter(n => n.id !== id);

    await updateNotificationList(filtered);
}

async function connect() {

    if (socket) {

        if (socket.url === relayUrl) {
            return;
        }

        socket.close();
    }

    socket = new WebSocket(relayUrl);

    console.log(`Attempting to connect a websocket to ${relayUrl}.`);

    socket.onopen = async () => {
        console.log(`Websocket connected.`);
        await browser.storage.local.set({
            connected: true
        });
    };

    socket.onmessage = rawEvent => {
        const event = JSON.parse(rawEvent.data);
        handleNotification(event);
    };

    socket.onclose = async (e) => {
        console.log("Websocket closed.", e);
        await browser.storage.local.set({
            connected: false
        });
    };

    socket.onerror = e => {
        console.log("Websocket error.", e);
        socket.close();
        setTimeout(connect, 5000);
    };
}

async function handleNotification(event) {

    const notification = {
        id: crypto.randomUUID(),
        title: getTitleFromType(event.eventType) ?? "Notification",
        description: event.payload?.description ?? "New event",
        url: event.payload?.url ?? "",
        createdAt: Date.now()
    }

    await addNotification(notification);
}

function getTitleFromType(type) {

    switch (type) {
        case "ms.vss-code.git-pullrequest-comment-event":
            return "New Pull Request comment";

        case "git.pullrequest.created":
            return "New Pull Request"

        case "workitem.updated":
            return "Work item updated";

        case "build.complete":
            return "Build completed";

        default:
            return type;
    }
}

async function start() {

    const notifications = await getNotifications();

    updateBadge(notifications.length);

    connect();

    browser.runtime.onMessage.addListener(async message => {
        switch (message.type) {

            case "GetNotifications":

                return getNotifications();

            case "RemoveNotification":

                await removeNotification(message.id);

                return;
        }
    });
}

start();