function onCondition() {
    if (!g_form.getValue('identification_type')) {
        // Set 'UserName Identification" as default 
        g_form.setValue('identification_type', 'fc7bf2b3bf220100710071a7bf0739b4');
    }
    if (document.getElementById('process_strength_configuration'))
        document.getElementById('process_strength_configuration').style.display = 'block';
}
