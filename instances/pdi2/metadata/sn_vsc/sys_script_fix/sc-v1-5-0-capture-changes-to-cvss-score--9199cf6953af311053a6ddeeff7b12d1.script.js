var scComplianceUtil = new sn_vsc.VSCComplianceUtil();
var gr = new GlideRecord('sn_vsc_instance_hardening_settings');
gr.addEncodedQuery("harc_name=Require Authorization for WSDL Request^ORharc_name=Prevent Users From Accepting Warning To Bypass CSRF Validation");
gr.query();
while (gr.next()) {
	scComplianceUtil.updateSettingsInsert(gr.sys_id, gr.compliance_status);
}
