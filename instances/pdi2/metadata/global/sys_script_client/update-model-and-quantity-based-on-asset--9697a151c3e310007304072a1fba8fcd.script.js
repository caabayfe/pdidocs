function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '')
        return;
    var asset = undefined;
    var model = undefined;

    function updateRecord() {
		if (asset === undefined || model === undefined)
            return;
        if (model != asset.model)
            g_form.setValue('model', asset.model);

        if ('pre_allocated' == asset.substatus)
            g_form.setValue('quantity_requested', asset.quantity);

    }

    g_form.getReference('asset', function(value) {
        asset = value;
        updateRecord();
    });
    g_form.getReference('model', function(value) {
        model = value;
        updateRecord();
    });
}
