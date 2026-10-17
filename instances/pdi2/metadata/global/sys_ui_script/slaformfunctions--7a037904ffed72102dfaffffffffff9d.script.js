function clearNonPermanentMessages() {
    g_form.clearMessages();
    showPermanentMessages();
}

function showPermanentMessages() {
    if (!g_scratchpad || !g_scratchpad.permanentMessages)
        return;

    g_scratchpad.permanentMessages.forEach(function(message) {
        g_form.addInfoMessage(message);
    });
}
