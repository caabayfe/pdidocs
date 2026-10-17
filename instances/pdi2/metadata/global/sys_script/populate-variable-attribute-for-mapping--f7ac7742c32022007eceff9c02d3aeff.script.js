(function executeRule(current, previous /*null when async*/) {
	if (gs.nil(current.attributes) || current.attributes.indexOf("element_mapping_provider")<0) {
        if (!gs.nil(current.attributes)) {
            current.attributes += ",";
        }
        current.attributes += "element_mapping_provider=com.glide.automated_testing_framework.ATFVariableElementMapper";
    }

})(current, previous);
