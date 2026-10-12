(function() {
    if (GlidePluginManager.isZboot())
        return;

    var gr = new GlideRecord('chg_model');
    gr.setWorkflow(false);
    gr.setValue('apply_record_preset', true);
    gr.updateMultiple();
})();
