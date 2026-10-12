(function() {
    gs.info("CMDB - Health Config update start");
    if (pm.isZboot()) {
        gs.info("CMDB - Health Config update skipped due to zboot");
        return;
    }
    var gr = new GlideRecord('sys_dictionary');
    var ALLOW_PUBLIC_ATTRIB = 'allow_public';
    gr.addQuery('name', 'cmdb_health_config');
    gr.addQuery('element', 'applies_to');
    gr.query();

    while (gr.next()) {
        // If customer does not already have attribute then add
        if (!gr.getValue('attributes').includes(ALLOW_PUBLIC_ATTRIB)) {
            var attributesStr = gr.getValue('attributes');
            attributesStr = attributesStr + ',' + ALLOW_PUBLIC_ATTRIB + '=true';
            gr.setValue('attributes', attributesStr);
            gr.update();
            gs.info("CMDB - Health Config update completed");
        } else {
            gs.info("CMDB - Health Config update skipped due to existing allow_public");
        }
    }
})();
