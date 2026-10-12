function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue == '')
        return;
    var currentStage = g_form.getValue('stage');
    if (['cancelled', 'delivered', 'received'].indexOf(currentStage) !== -1)
        return;
    var asset = undefined;
    var model = undefined;

    function updateRecord() {
        if (asset === undefined || model === undefined)
            return;

        var stage = currentStage;

        if (!isLoading && asset != null && newValue != asset.model) {
            g_form.setValue('asset', '');
            asset = null;
        }

        if (model.sys_class_name == 'cmdb_consumable_product_model' || model.asset_tracking_strategy == 'track_as_consumable') {
            // consumable
            g_form.setMandatory('asset', false);
            g_form.setReadonly('asset', true);
            if (stage != 'received' && stage != 'delivered')
                g_form.setReadonly('quantity_requested', false);
            else
                g_form.setReadonly('quantity_requested', true);
        } else {
            // real asset
            if (asset != null && stage != 'cancelled') {
                var quantity = (asset != null && asset.substatus == 'pre_allocated') ? asset.quantity : 1;
                g_form.setValue('quantity_requested', quantity);
            }
            g_form.setMandatory('asset', true);
            g_form.setReadonly('quantity_requested', true);
        }

        if (stage == 'cancelled')
            g_form.setValue('quantity_requested', 0);
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
