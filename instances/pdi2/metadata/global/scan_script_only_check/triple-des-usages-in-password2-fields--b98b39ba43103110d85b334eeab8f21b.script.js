(function(engine) {
    var PARENT_MODULE_ID = '7d7ee9e3b7030010ebf7082e7e11a979';

    //Function to get the KMF Submodules for password2
	function getPassword2ModuleScopeList() {
		var password2ModuleScopeList = [];
		var gr = new GlideRecord('sys_kmf_crypto_module');
		gr.addQuery('parent_crypto_module', PARENT_MODULE_ID);
		gr.query();
		while (gr.next()) {
			password2ModuleScopeList.push(gr.getValue('sys_package'));
		}
		return password2ModuleScopeList;
	}
	var password2CryptoScopeList = getPassword2ModuleScopeList();
	var query1 = 'attributesLIKEis_legacy_password2=true^attributesNOT LIKEuse_instance_level_glideencrypter=true^NQ';
	var query2 = 'attributesLIKEuse_legacy_glideencrypter=true^attributesNOT LIKEis_legacy_password2=true';
	var query = query1 + query2;
	var sysDictionaryGr = new GlideRecord('sys_dictionary');
	sysDictionaryGr.addQuery('internal_type', 'password2');
	sysDictionaryGr.addEncodedQuery(query);
	sysDictionaryGr.addQuery('name', 'DOES NOT CONTAIN', 'var__m_');
	sysDictionaryGr.query();
	while (sysDictionaryGr.next()) {
		var scope = sysDictionaryGr.getValue('sys_package');
		if(password2CryptoScopeList.indexOf(scope) > -1){
			continue;
		}
		var tableName = sysDictionaryGr.getValue('name');
		engine.finding.setCurrentSource(sysDictionaryGr);
		engine.finding.setValue('finding_details', "Table Name:" + tableName);
		engine.finding.increment();
	}
})(engine);
