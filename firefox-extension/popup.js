const relayInputField = document.getElementById("relayUrl");
const save = document.getElementById("save");
const confirmationMessage = document.getElementById("confirmationMessage");

browser.storage.local
    .get("relayUrl")
    .then(data => {
        relayInputField.value = data.relayUrl || "";
    });

save.addEventListener("click", async () => {
    await browser.storage.local.set({
        relayUrl: relayInputField.value
    });

    confirmationMessage.style.display = "block";
});

confirmationMessage.style.display = "none";