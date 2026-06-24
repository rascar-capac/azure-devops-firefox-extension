const container = document.getElementById("notifications");

async function reloadNotifications() {

    const notifications = await browser.runtime.sendMessage({ type: "GetNotifications" });

    renderNotifications(notifications);
}

function renderNotifications(notifications) {

    container.innerHTML = "";

    if (notifications.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "No notification";
        container.appendChild(empty);

        return;
    }

    for (const notification of notifications) {
        const title = document.createElement("div");
        title.className = "notification-title";
        title.textContent = notification.title;

        const content = document.createElement("div");
        content.className = "notification-content";
        content.textContent = notification.description;

        const close = document.createElement("button");
        close.className = "notification-close";
        close.textContent = "×";
        close.addEventListener("click", async e => {
            e.stopPropagation();

            await removeNotification(notification);

            reloadNotifications();
        });

        const card = document.createElement("div");
        card.className = "notification";
        card.appendChild(title);
        card.appendChild(content);
        card.appendChild(close);
        card.addEventListener("click", async () => {
            if (notification.url) {
                browser.tabs.create({ url: notification.url });
            }

            await removeNotification(notification);

            window.close();
        });

        container.appendChild(card);
    }
}

async function removeNotification(notification) {
    await browser.runtime.sendMessage({
        type: "RemoveNotification",
        id: notification.id
    });
}

reloadNotifications();