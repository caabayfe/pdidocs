var scComplianceUtil = new sn_vsc.VSCComplianceUtil();
var gr = new GlideRecord('sn_vsc_instance_hardening_settings');
gr.addEncodedQuery("harc_name=Enable Account Recovery^ORharc_name=Enable Updated Version of Multi SSO Plugin");
gr.query();
while(gr.next()) {
	scComplianceUtil.updateSettingsInsert(gr.sys_id, gr.compliance_status);
}
