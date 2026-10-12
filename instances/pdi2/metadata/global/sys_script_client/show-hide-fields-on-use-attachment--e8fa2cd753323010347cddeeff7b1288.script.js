function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue == 'true') {
        _hide('template_content');
        MIDDeploymentTemplate_UseAttachment.parentNode.style.display = "block";
        _show('file_attachment', true);
    } else {
        _show('template_content', true);
        MIDDeploymentTemplate_UseAttachment.parentNode.style.display = "none";
        _hide('file_attachment');
    }

}

function _hide(fieldname) {
    g_form.setMandatory(fieldname, false);
    g_form.setDisplay(fieldname, false);
}

function _show(fieldname, isRequired) {
    if (isRequired)
        g_form.setMandatory(fieldname, true);
    g_form.setDisplay(fieldname, true);
}
