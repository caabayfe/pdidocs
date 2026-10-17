(function executeRule(current, previous /*null when async*/ ) {
    // Retrieve the referenced shape_property record
    var shapePropertyRecord = new GlideRecord('sn_diagram_builder_shape_property');
    if (shapePropertyRecord.get(current.shape_property) && shapePropertyRecord.isValidRecord()) {

        if (shapePropertyRecord.target_property && !shapePropertyRecord.target_property.startsWith('_')) {
            gs.addErrorMessage(gs.getMessage("The shape property must start with an underscore ( {0} ) for custom value types.", '_'));
            current.setAbortAction(true);
        }
    }

})(current, previous);
