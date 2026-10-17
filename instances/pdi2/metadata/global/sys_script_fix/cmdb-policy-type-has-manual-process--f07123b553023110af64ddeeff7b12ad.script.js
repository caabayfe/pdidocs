gs.info('Starting to set has_manual_process to false for empty/null values on cmdb_policy_type table');
var grPolicyType = new GlideRecord('cmdb_policy_type');
grPolicyType.addEncodedQuery('has_manual_processISEMPTY');
grPolicyType.query();
grPolicyType.setValue('has_manual_process', false);
grPolicyType.updateMultiple();
gs.info('Done setting has_manual_process to false for empty/null values on cmdb_policy_type table');
