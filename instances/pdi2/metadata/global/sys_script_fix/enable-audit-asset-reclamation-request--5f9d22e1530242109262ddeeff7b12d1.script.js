function enableAuditAssetReclamationRequest() {
	var rec = new GlideRecord('sys_dictionary');
	rec.addQuery('name', 'asset_reclamation_request');
	rec.addNullQuery('element');
	rec.setValue('audit', true);
	rec.updateMultiple();
}
enableAuditAssetReclamationRequest();
