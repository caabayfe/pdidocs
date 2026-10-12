function ok() {
    GlideDialogWindow.get().destroy();
	window.location.href = "/navpage.do";
    return true;
}

function cancel() {
    GlideDialogWindow.get().destroy();
    return false;
}
