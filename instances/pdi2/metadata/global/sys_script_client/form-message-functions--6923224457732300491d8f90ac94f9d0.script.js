function onLoad() {
}

function addPermanentMessage(message) {
    if (!message)
        return;

    if (!g_scratchpad)
        return;

    if (!g_scratchpad.permanentMessages)
        g_scratchpad.permanentMessages = [];

    g_scratchpad.permanentMessages.push(message);
}

function showPermanentMessages() {
    if (!g_scratchpad || !g_scratchpad.permanentMessages)
        return;

    g_scratchpad.permanentMessages.forEach(function(message) {
        g_form.addInfoMessage(message);
    });
}

function clearNonPermanentMessages() {
    g_form.clearMessages();
    showPermanentMessages();
}
