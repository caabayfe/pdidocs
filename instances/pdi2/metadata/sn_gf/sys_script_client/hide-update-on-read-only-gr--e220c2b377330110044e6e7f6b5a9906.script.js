function onLoad() {

    if (g_form.getEditableFields().length == 0) {
        var updateButtonTop = top.document.getElementById("sysverb_update");
        var updateButtonBottom = top.document.getElementById("sysverb_update_bottom");
        if (updateButtonTop != null)
            updateButtonTop.style.display = "none";
        if (updateButtonBottom != null)
            updateButtonBottom.style.display = "none";
    }

}
