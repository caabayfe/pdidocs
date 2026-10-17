(function executeRule(current, previous /*null when async*/ ) {

    // ensure the attribute already doesn't exist for the current datasource (datasource must be active)
    var gr = new GlideRecord('ais_datasource_field_attribute');
    gr.addQuery('datasource', current.datasource);
    gr.addQuery('datasource.active', true);
    gr.addQuery('source', current.source);
    gr.addQuery('field', current.field);
    gr.addQuery('attribute', current.attribute);
    gr.addQuery('sys_id', '!=', current.getUniqueValue());
    gr.query();
    if (gr.next()) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage("Attribute '{0}' already exists for {1} : {2}", [current.attribute.attribute, current.source, current.field]));
        return;
    }

    // ensure 1 to 1 mapping for common fields (datasource must be active)
    if (current.attribute.attribute == 'map_to' || current.attribute.attribute == 'map_to_raw') {
        gr.initialize();
        gr.addQuery('datasource', current.datasource);
        gr.addQuery('datasource.active', true);
        gr.addQuery('source', current.source);
        // map_to f734a634c7320010d1cfd9795cc26094 and map_to_raw 8f86f1a8b7021010ba148481de11a9a8
        gr.addQuery('attribute', 'IN','f734a634c7320010d1cfd9795cc26094,8f86f1a8b7021010ba148481de11a9a8');
        gr.addQuery('value', current.value);
        gr.addQuery('sys_id', '!=', current.getUniqueValue());
        gr.query();
        if (gr.next()) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("'{0}' already mapped for {1}", [current.value, current.source]));
        }
    }

})(current, previous);
