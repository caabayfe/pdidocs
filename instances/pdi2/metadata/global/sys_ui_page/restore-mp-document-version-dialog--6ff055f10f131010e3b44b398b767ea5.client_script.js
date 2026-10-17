function cancel() {
    destroyDialog();
    return false;
}

function destroyDialog() {
    GlideDialogWindow.get().destroy();
}
