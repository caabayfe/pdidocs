gs.info("kafkaCredsFix - fixing SASL creds to use PLAIN");
var saslKafkaCredsGR = new GlideRecord("kafka_ssl_credentials");
saslKafkaCredsGR.addEncodedQuery("security_protocol=SASL_SSL^sasl_jaas_config=NULL^ORsasl_mechanism=NULL");
saslKafkaCredsGR.setValue("sasl_jaas_config",'org.apache.kafka.common.security.plain.PlainLoginModule required username="${username}" password="${password}";');
saslKafkaCredsGR.setValue("sasl_mechanism", "PLAIN");
saslKafkaCredsGR.updateMultiple();

gs.info("kafkaCredsFix - finished fixing SASL creds, starting fixing additional properties");

//searching for properties with semicolon inside ';'
var kafkaCreds = new GlideRecord('kafka_ssl_credentials');		
kafkaCreds.addEncodedQuery("additional_propertiesLIKE;");
kafkaCreds.query();           
while (kafkaCreds.next()) {
	var oldVal = kafkaCreds.getValue("additional_properties");
    var replacedVal = kafkaCreds.getValue("additional_properties").replaceAll(";","@#@#");
	kafkaCreds.setValue("additional_properties", replacedVal);
	gs.info("kafkaCredsFix - replacing from "+ oldVal + " to: "+replacedVal);
	kafkaCreds.update();
} 

gs.info("kafkaCredsFix - finished fixing additional_properties, starting fixing hint for additional properties");

var docGR = new GlideRecord('sys_documentation');		
docGR.addQuery("name", "kafka_ssl_credentials");
docGR.addQuery("element", "additional_properties");
docGR.addQuery('language', 'en');
docGR.query();           
if (docGR.next()) {
	docGR.setValue("hint", "String of additional Kafka Consumer properties separated by @#@#, for example: ssl.protocol=TLSv1.2@#@#ssl.enabled.protocols=TLSv1.2,TLSv1.1");
	docGR.setWorkflow(false);
	docGR.update();
	gs.log("kafkaCredsFix - hint was updated");
} else {
	gs.error("kafkaCredsFix - Failed to update dictionary entry for table: sys_documentation, could not find a valid dictionary record for field: additional_properties");
}

gs.info("kafkaCredsFix - finished fixing all");
