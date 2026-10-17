function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    switch (newValue) {
        case 'hpa_v1':
            _showSession('enter_hpav1configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas', 'hpa_v1_target_cpu_utilization_percentage']);
            _hideSession('enter_hpav2configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas']);
            break;
        case 'hpa_v2':
            _showSession('enter_hpav2configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas']);
            _hideSession('enter_hpav1configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas', 'hpa_v1_target_cpu_utilization_percentage']);
            break;
        case '':
            _hideSession('enter_hpav1configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas', 'hpa_v1_target_cpu_utilization_percentage']);
            _hideSession('enter_hpav2configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas']);
            break;
        default:
            _hideSession('enter_hpav1configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas', 'hpa_v1_target_cpu_utilization_percentage']);
            _showSession('enter_hpav2configuration', ['hpa_v1_min_replicas', 'hpa_v1_max_replicas']);
            break;
    }
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
