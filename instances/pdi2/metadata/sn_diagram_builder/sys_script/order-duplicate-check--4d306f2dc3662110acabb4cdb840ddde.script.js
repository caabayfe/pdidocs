(function executeRule(current, previous /*null when async*/ ) {

    var shapePropertyOverrideToTemplateGr = new GlideRecord('sn_diagram_builder_shape_property_override_to_shape_template');

    // 2. Build query
    shapePropertyOverrideToTemplateGr.addQuery('shape_property_override', current.shape_property_override.sys_id);
    shapePropertyOverrideToTemplateGr.addQuery('sys_id', '!=', current.sys_id);

    // 3. Execute query 
    shapePropertyOverrideToTemplateGr.query();

    // 4. Process returned records
    while (shapePropertyOverrideToTemplateGr.next()) {
        if (current.order == shapePropertyOverrideToTemplateGr.order) {
            gs.addErrorMessage(gs.getMessage("Order has to be unique for dependent shape templates"));
            current.setAbortAction(true);
        }
    }

})(current, previous);
