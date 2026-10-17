function navigate_to_record() {
    if (gel('p_found').value == 'true') {
        var c = gel('selection_result');
        c.value = "navigate";
        return true;
    } else {
        GlideDialogWindow.get().destroy();
        return false;
    }
}

function create_record() {
    var c = gel('selection_result');
    c.value = "create";
    return true;
}
