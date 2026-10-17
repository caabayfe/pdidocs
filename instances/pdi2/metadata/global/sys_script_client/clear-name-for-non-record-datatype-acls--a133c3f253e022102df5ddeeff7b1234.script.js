function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
        return;

    if (g_form.getValue('type') == 'record')
        return;

    var name = g_form.getValue('name');

    if (isDataTypeAcl(name)) {
        g_form.clearValue('name');
        g_form.showFieldMsg('name', getMessage('Datatype ACLs must be of record type.'), 'error');
    }

    function hasOnePairOfOpeningAndClosingBrackets(str) {
        return /^\[[^\[\]]*\]$/.test(str);
    }

    function isDataTypeAcl(str) {
        if (!str.includes('.'))
          return false;

        var parts = str.split('.');
        return hasOnePairOfOpeningAndClosingBrackets(parts[1]);
    }
}
