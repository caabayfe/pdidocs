var referringRecordSysId = action.getGlideURI().getMap().get('sysparm_collectionID');
var referringRecord;
var ruleSequenceSysId;
if (RP.getParameterValue("sysparm_collection") == "sys_record_transformer" ) {
	referringRecord = new GlideRecord("sys_record_transformer");
	referringRecord.get(referringRecordSysId);
	ruleSequenceSysId = referringRecord.rule_sequence.toString();
} else if (RP.getParameterValue("sysparm_collection") == "sys_record_transformer_rule_sequence" ) {
	referringRecord = new GlideRecord("sys_record_transformer_rule_sequence");
	referringRecord.get(referringRecordSysId);
	ruleSequenceSysId = referringRecordSysId;
}

action.setRedirectURL("sys_record_transformer_rule.do?sysparm_query_override=rule_sequence=" + ruleSequenceSysId);
action.setReturnURL(referringRecord);
