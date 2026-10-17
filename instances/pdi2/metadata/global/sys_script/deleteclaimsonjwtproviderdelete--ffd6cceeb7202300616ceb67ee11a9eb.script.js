(function executeRule(current, previous /*null when async*/) {
	// Delete all the associated Claims on delete of Current JWT Provider.
	var claimsGlideRecord = new GlideRecord('jwt_claim_validation');
	claimsGlideRecord.initialize();
    claimsGlideRecord.addQuery('jwt_provider', current.getUniqueValue());
    claimsGlideRecord.deleteMultiple();

})(current, previous);
