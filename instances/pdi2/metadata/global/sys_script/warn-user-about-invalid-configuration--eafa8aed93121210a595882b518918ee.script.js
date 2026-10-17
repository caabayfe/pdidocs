(function executeRule(current, previous /*null when async*/) {

    // Define an array to store concatenated source and field
    var mandatoryFields = [];
    // Query the ais_datasource_field_attribute table
    var gr = new GlideRecord("ais_datasource_field_attribute");
    gr.addQuery("source", current.source);
    gr.addQuery("attribute", "b744a634c7320010d1cfd9795cc26011"); // no_text_index
    gr.addQuery("value", "true");
    gr.query();

    while (gr.next()) {
        var sourceField = gr.getValue('source'); 
        var field = gr.getValue('field');  

        if (sn_ais.AisUtil.isMandatoryField(sourceField, field)) {
            mandatoryFields.push(sourceField + '.' + field);
        }
    }

    if (mandatoryFields.length === 0) {
        return;
    }

    gs.addInfoMessage(gs.getMessage("This index source has following mandatory fields configured as no_text_index = true : {0}. These configuration are ignored.", mandatoryFields.join(', ')));

})(current, previous);
