function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue == 'true') {
        _show('os_name', false);
        _hideSession('specify_midservernames', ['mid_server_name_prefix', 'mid_quantity', 'mid_server_names']);
        _show('replicas', false);
        _show('hpa_choice', false);
        if (g_form.getValue('hpa_choice') == 'hpa_v1') {
            _showSession('enter_hpav1configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas', 'hpa_v1_target_cpu_utilization_percentage']);
        } else {
            _hideSession('enter_hpav1configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas', 'hpa_v1_target_cpu_utilization_percentage']);
        }
        MIDDeploymentRequest_NumberOfReplicas.parentNode.style.display = "block";
        _show('mid_server_name_template', true);
        MIDDeploymentRequest_MIDServerNameTemplate.parentNode.style.display = "block";
        _showSession('enter_statefulsetinfo', ['ss_name', 'ss_service_name', 'pvc_name', 'pvc_storage_class', 'pvc_storage_request']);
    } else {
        _hide('os_name');
        _hide('replicas');
        _hide('hpa_choice');
        _hideSession('enter_hpav1configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas', 'hpa_v1_target_cpu_utilization_percentage']);
        MIDDeploymentRequest_NumberOfReplicas.parentNode.style.display = "none";
        _hide('mid_server_name_template');
        MIDDeploymentRequest_MIDServerNameTemplate.parentNode.style.display = "none";
        _hideSession('enter_statefulsetinfo', ['ss_name', 'ss_service_name', 'pvc_name', 'pvc_storage_class', 'pvc_storage_request']);
        _showSession('specify_midservernames', ['mid_server_name_prefix', 'mid_quantity', 'mid_server_names']);
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

function _hideSession(name, requiredFields) {
    for (var i = 0; i < requiredFields.length; i++)
        g_form.setMandatory(requiredFields[i], false);

    g_form.setSectionDisplay(name, false);
}

function _showSession(name, requiredFields) {
    for (var i = 0; i < requiredFields.length; i++)
        g_form.setMandatory(requiredFields[i], true);

    if (name == 'specify_midservernames') {
        if (g_form.getBooleanValue('auto_generate_mid_names')) {
            _hide('mid_server_names');
        } else {
            _show('mid_server_names', true);
            g_form.setMandatory('mid_server_name_prefix', false);
            g_form.setMandatory('mid_quantity', false);
        }
    }

    g_form.setSectionDisplay(name, true);
}
