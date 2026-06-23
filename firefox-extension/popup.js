const relayInputField = document.getElementById("relayUrl");
const save = document.getElementById("save");
const confirmationMessage = document.getElementById("confirmationMessage");
const status = document.getElementById("status");

browser.storage.local
    .get("relayUrl")
    .then(data => {
        relayInputField.value = data.relayUrl || "";
    });

browser.storage.local
    .get("connected")
    .then(data => updateStatusText(data));

save.addEventListener("click", async () => {
    await browser.storage.local.set({
        relayUrl: relayInputField.value
    });

    confirmationMessage.style.display = "block";
});

confirmationMessage.style.display = "none";

function updateStatusText(data) {
    status.innerHTML = data.connected ? "CONNECTED" : "OFFLINE";
}

browser.storage.onChanged.addListener(updateStatusText);