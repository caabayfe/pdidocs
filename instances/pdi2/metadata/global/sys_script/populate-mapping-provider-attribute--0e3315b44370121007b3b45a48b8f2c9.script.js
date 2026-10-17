(function executeRule(current, previous /*null when async*/ ) {
    var attributes = current.getValue("attributes");
    if (gs.nil(attributes) || attributes.indexOf("element_mapping_provider") < 0) {
        attributes = gs.nil(attributes) ? "" : attributes + ",";
        attributes += "element_mapping_provider=com.glide.automated_testing_framework.ATFVariableElementMapper";
        current.setValue("attributes", attributes);
    }
})(current, previous);
