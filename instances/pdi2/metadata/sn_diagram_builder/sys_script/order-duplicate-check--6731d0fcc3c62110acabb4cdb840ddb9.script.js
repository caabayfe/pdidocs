(function executeRule(current, previous /*null when async*/ ) {

    var shapePropertyToTemplateGr = new GlideRecord('sn_diagram_builder_shape_property_to_shape_template');

    // 2. Build query
    shapePropertyToTemplateGr.addQuery('shape_property', current.shape_property.sys_id);
    shapePropertyToTemplateGr.addQuery('sys_id', '!=', current.sys_id);

    // 3. Execute query 
    shapePropertyToTemplateGr.query();

    // 4. Process returned records
    while (shapePropertyToTemplateGr.next()) {
        if (current.order == shapePropertyToTemplateGr.order) {
            gs.addErrorMessage(gs.getMessage("Order has to be unique for dependent shape templates"));
            current.setAbortAction(true);
        }
    }

})(current, previous);
