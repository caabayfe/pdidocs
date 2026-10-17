function onSubmit() {
    if (!g_form.isVisible('controlled_by_refs')) {
        // if the user is using CbR but has hidden the field, don't clear it
        if (isValidForCBR())
            return true;

        g_form.clearValue('controlled_by_refs');
    }

    function isValidForCBR() {
        var type = g_form.getValue('type');
        var operation = g_form.getValue('operation');

        return (type === 'record') && ((operation === 'create') || (operation === 'read') || (operation === 'write') || (operation === 'delete'));
    }
}
