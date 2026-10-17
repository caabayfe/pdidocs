(function executeRule(current, previous /*null when async*/ ) {
    if (!current) return;

    var eventRuleUtil = new EventRuleUtil();

    var runAfterBindingEnabled = eventRuleUtil.isFieldMappingRunAfterBindingEnabled();

	// Prefixes should be set event if 'Run after binding' is disabled as they are in use to validate mapping types 
	// also when 'Run after binding' is not relevant. 
	// For example: to prevent CI prefixes in Source field for 'Map field using regex' mapping type
	g_scratchpad.field_mapping_add_info_prefix = eventRuleUtil.getFieldMappingFromFieldAddInfoPrefix();
	g_scratchpad.field_mapping_ci_prefix = eventRuleUtil.getFieldMappingFromFieldCmdbCiPrefix();
    g_scratchpad.field_mapping_cmdb_key_value_prefix = eventRuleUtil.getFieldMappingFromFieldCmdbKeyValuePrefix();

    if (runAfterBindingEnabled) {
        g_scratchpad.field_mapping_run_after_binding = 'true';
    } else
        g_scratchpad.field_mapping_run_after_binding = 'false';

})(current, previous);
