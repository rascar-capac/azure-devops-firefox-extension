let socket;
let relayUrl;

async function connect() {

    const data = await browser.storage.local.get("relayUrl");

    if (!data.relayUrl) {
        return;
    }

    if (data.relayUrl === relayUrl) {
        return;
    }

    relayUrl = data.relayUrl;

    if (socket) {

        if (socket.url === relayUrl) {
            return;
        }

        socket.close();
    }

    socket = new WebSocket(relayUrl);

    console.log(`Attempting to connect a websocket to ${relayUrl}.`);

    socket.onopen = () => {
        console.log(`Websocket connected.`);
    };

    socket.onmessage = event => {
        const message = JSON.parse(event.data);
        handleNotification(message);
    };

    socket.onclose = e => {
        console.log("Websocket closed.", e);
    };

    socket.onerror = e => {
        console.log("Websocket error.", e);
        socket.close();
        setTimeout(connect, 5000);
    };
}

function handleNotification(message) {

    const type = message.eventType || "unknown";
    let title = "Azure DevOps";
    let body = "New event";

    switch (type) {
        case "ms.vss-code.git-pullrequest-comment-event":
            title = "Pull Request";
            body = "New comment";
            break;

        case "git.pullrequest.created":
            title = "Pull Request";
            body = "New pull request";
            break;

        case "workitem.updated":
            title = "Work Item";
            body = "Work item updated";
            break;

        case "build.complete":
            title = "Build";
            body = "Build completed";
            break;
    }

    browser.notifications.create({
        type: "basic",
        title,
        message: body
    });
}

connect();

browser.storage.onChanged.addListener(connect);