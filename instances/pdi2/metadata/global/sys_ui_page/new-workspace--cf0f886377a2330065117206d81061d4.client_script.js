function closeGacModal() {
    GlideDialogWindow.get().destroy();
    window.removeEventListener('message', onMessage);
}

window.addEventListener('message', onMessage);

function onMessage(message) {
    var data = message.data;
    var origin = message.origin;
    var action = data.action;

    if (origin !== window.location.origin)
        return;

    if (action === 'app-creator-cancel' || action === 'app-creator-success') {
        closeGacModal();
    }

    window.location.href = '/sys_aw_master_config_list.do';
}
