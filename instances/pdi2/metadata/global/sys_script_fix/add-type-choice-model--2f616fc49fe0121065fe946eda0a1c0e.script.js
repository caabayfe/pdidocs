(function() {
    if (!GlidePluginManager.isZboot()) {
        var modelChoiceSysId = 'c1aded169f98521065fe946eda0a1c14';
        var gr = new GlideRecord('sys_choice');
        if (!gr.get(modelChoiceSysId)) {
            gs.log('Creating sys_choice for change_request.type: model', '[com.snc.change_management.change_model][Fix Script: Add type choice: model]');
            var newTypeChoicegr = new GlideRecord('sys_choice');
            newTypeChoicegr.setNewGuidValue('c1aded169f98521065fe946eda0a1c14');
            newTypeChoicegr.setValue('name', 'change_request');
            newTypeChoicegr.setValue('element', 'type');
            newTypeChoicegr.setValue('value', 'model');
            newTypeChoicegr.setValue('inactive', 'false');
            newTypeChoicegr.setValue('label', 'Model');
            newTypeChoicegr.setValue('language', 'en');
            newTypeChoicegr.setValue('sequence', '4');
            newTypeChoicegr.setWorkFlow(false);
            newTypeChoicegr.insert();
        } else
            gs.log('sys_choice for change_request.type: model already exists', '[com.snc.change_management.change_model][Fix Script: Add type choice: model]');
    }
})();
