function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    switch (newValue) {
        case 'auto_select':
            MIDConfigAnnotation1.parentNode.style.display = "block";
            _show('mid_capabilities', true);
            MIDConfigAnnotation2.parentNode.style.display = "block";
            _show('mid_application', true);
            _hide('mid_server');
            _hide('mid_cluster');
            break;
			
        case 'specific_cluster':
            MIDConfigAnnotation1.parentNode.style.display = "none";
            _hide('mid_capabilities');
            MIDConfigAnnotation2.parentNode.style.display = "none";
            _hide('mid_application');
            _hide('mid_server');
            _show('mid_cluster', true);
            break;

        case 'specific_mid_server':
            MIDConfigAnnotation1.parentNode.style.display = "none";
            _hide('mid_capabilities');
            MIDConfigAnnotation2.parentNode.style.display = "none";
            _hide('mid_application');
            _show('mid_server', true);
            _hide('mid_cluster');
            break;
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
