function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    control.placeholder = 'https://example.com';
    if (g_form.getValue('url_source') == 'custom') {
        var re = /^(http[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9_{}\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
        if (newValue && !re.test(newValue)) {
            var errorMessage = getMessage('Invalid url');
            g_form.showFieldMsg('url_custom', errorMessage, 'error');
        }
    }
    var infoMessage = getMessage('Url can also have values from the fields of both Table and Reference table in the following format {table.<fieldname>} or {reference_table.<fieldname>}');
    g_form.showFieldMsg('url_custom', infoMessage, 'info');
}
