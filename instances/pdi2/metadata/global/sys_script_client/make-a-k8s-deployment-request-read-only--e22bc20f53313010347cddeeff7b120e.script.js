function onLoad() {
    if (!g_form.isNewRecord() && g_form.getValue('state') != 'new') {
        var fields = g_form.getEditableFields();
        for (var x = 0; x < fields.length; x++) {
            g_form.setReadOnly(fields[x], true);
        }
        var infoMsg = getMessage("This deployment request cannot be changed because it is already in processing or processed.");
        g_form.addInfoMessage(infoMsg);
    }
    var maxMidQuantity = g_scratchpad.mid_deployment_max_mid_quantity;
    var msg = formatMessage(getMessage('MID deployment request  - MID server quantity'), maxMidQuantity);
    MIDDeploymentRequest_MIDQuantity.parentNode.innerHTML = msg;
    msg = formatMessage(getMessage('MID deployment request - number of replicas'), maxMidQuantity);
    MIDDeploymentRequest_NumberOfReplicas.parentNode.innerHTML = msg;

    if (g_form.getValue('ss_choice')) {
        g_form.setSectionDisplay('specify_midservernames', false);
        g_form.setSectionDisplay('enter_statefulsetinfo', true);
        if (g_form.getValue('hpa_choice') == 'hpa_v1') {
            g_form.setSectionDisplay('enter_hpav1configuration', true);
        } else {
            g_form.setSectionDisplay('enter_hpav1configuration', false);
        }
    } else {
        g_form.setSectionDisplay('enter_statefulsetinfo', false);
        g_form.setSectionDisplay('specify_midservernames', true);
        g_form.setSectionDisplay('enter_hpav1configuration', false);
    }
}
