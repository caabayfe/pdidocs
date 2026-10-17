function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '') {
        return;
    }

    var name = g_form.getValue('name');
    if (isEmpty(name) || !g_form.isNewRecord())
        return;

    var userChosenNamespace = g_form.getValue('namespace');
    if (!isEmpty(userChosenNamespace))
        return;

    var namespaceElement = g_form.getControl('namespace');
    namespaceElement.value = normalize(name);
}

function isEmpty(str) {
    return (!str || 0 === str.length);
}

function normalize(str) {
    return str.replace(/([-_ ][a-z])/ig, function(wordStart) {
            return wordStart.replace('-', '').replace('_', '').toUpperCase();
        })
        .replace(/[^a-z0-9]/ig, '')
        .replace(/^[0-9]+/, '')
        .replace(/^[A-Z]/, function(startChar) {
            return startChar.toLowerCase();
        });
}
