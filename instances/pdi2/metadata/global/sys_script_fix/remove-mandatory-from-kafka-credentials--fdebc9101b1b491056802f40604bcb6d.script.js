function removeMandatoryFromField(fieldName) {				
	gs.log("Removing from kafka_ssl_credentials mandatory for " +fieldName);
	var dictionaryGr = new GlideRecord('sys_dictionary');		
	dictionaryGr.addQuery("name", "kafka_ssl_credentials");
	dictionaryGr.addQuery("element", fieldName);
	dictionaryGr.query();           
	if (dictionaryGr.next()) {
		dictionaryGr.setValue("mandatory", "false");
		dictionaryGr.setWorkflow(false);
		dictionaryGr.update();
	} else {
		gs.log("Failed to fix dictionary entry for table: kafka_ssl_credentials could not find a valid dictionary record for field :" + fieldName);
	}
}

removeMandatoryFromField("key_password");
removeMandatoryFromField("keystore");
removeMandatoryFromField("keystore_password");
removeMandatoryFromField("truststore");
removeMandatoryFromField("truststore_password");
