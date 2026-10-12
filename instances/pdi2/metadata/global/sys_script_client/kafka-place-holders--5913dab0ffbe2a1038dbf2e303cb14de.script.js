function onLoad() {
   var sasl_mechanism = g_form.getControl('sasl_mechanism');
	sasl_mechanism.placeholder = "PLAIN";
	sasl_mechanism.style.textAlign="left";
		
	var sasl_jaas_config= g_form.getControl('sasl_jaas_config');
	sasl_jaas_config.placeholder = 'org.apache.kafka.common.security.plain.PlainLoginModule required username="${username}" password="${password}";';
	sasl_jaas_config.style.textAlign="left";	
   
}
