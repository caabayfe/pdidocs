(function() {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'cmn_notif_service_provider');
    gr.addQuery('element', 'script');
    gr.query();
    if (gr.next()) {
        if (gr.getValue('internal_type') != 'script_plain') {
            gr.setValue('internal_type', 'script_plain');
            gr.update();
            gs.log('DEF0733972: Updated cmn_notif_service_provider.script internal_type to script_plain');
        }
    } else {
        gs.log('DEF0733972: sys_dictionary entry for cmn_notif_service_provider.script not found; skipping');
    }
})();
