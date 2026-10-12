function updateSamEnterpriseLicensingHistory() {
	var gr = new GlideRecord(SAMLicensingUtility.ITAM_LICENSING_TABLE);
	gr.addQuery('application', SAMLicensingUtility.SAM_ENT_APP);
	gr.addQuery('resource_category', SAMLicensingUtility.SERVERS_CATEGORY);
	gr.addQuery('is_aggregated', false);
	gr.setWorkflow(false);
	gr.deleteMultiple();

	gr = new GlideRecord(SAMLicensingUtility.ITAM_LICENSING_TABLE);
	gr.addQuery('application', SAMLicensingUtility.CI_APP);
	gr.addQuery('resource_category', SAMLicensingUtility.SERVERS_CATEGORY);
	gr.addQuery('is_aggregated', false);
	gr.query();
	while (gr.next()) {
		var newGr = new GlideRecord(SAMLicensingUtility.ITAM_LICENSING_TABLE);
		newGr.setValue('application', SAMLicensingUtility.SAM_ENT_APP);
		newGr.setValue('resource_category', SAMLicensingUtility.SERVERS_CATEGORY);
		newGr.setValue('is_aggregated', false);
		newGr.setValue('resource_count', gr.getValue('resource_count'));
		newGr.setValue('su_count', gr.getValue('su_count'));
		newGr.setValue('su_ratio', gr.getValue('su_ratio'));
		newGr.setValue('sys_domain', gr.getValue('sys_domain'));
		newGr.setWorkflow(false);
		var sysId = newGr.insert();
		var newGr1 = new GlideRecord(SAMLicensingUtility.ITAM_LICENSING_TABLE);
		newGr1.get(sysId);
		newGr1.setValue('sys_created_on', gr.getValue('sys_created_on'));
		newGr1.setWorkflow(false);
		newGr1.update();
	}
}
updateSamEnterpriseLicensingHistory();
