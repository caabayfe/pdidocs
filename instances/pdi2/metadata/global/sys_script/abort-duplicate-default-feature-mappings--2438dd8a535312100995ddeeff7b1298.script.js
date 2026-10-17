(function executeRule(current, previous /*null when async*/) {
	if (current.document && current.document_table) {
        var featureMappingGr = new GlideRecord('sys_gen_ai_feature_mapping');
        featureMappingGr.addQuery('document', current.document);
		featureMappingGr.addQuery('document_table', current.document_table);
		featureMappingGr.addQuery('default_tier', true);
        featureMappingGr.query();

        // If a record with the same document + document_table combination already exists which is already a default tier, abort the action
        if (featureMappingGr.hasNext()) {
            gs.addErrorMessage(gs.getMessage("Duplicate feature mappings with default tiers not allowed"));
            current.setAbortAction(true); 
        }
	}
})(current, previous);
