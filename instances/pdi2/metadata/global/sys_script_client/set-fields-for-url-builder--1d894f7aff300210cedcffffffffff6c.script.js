function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue === '') {
		return;
	}
	
	if (newValue == "true") {
		g_form.setReadOnly("connection_url", true);
		g_form.setDisplay("mutual_auth", true);
		g_form.setDisplay("host",true );
		g_form.setDisplay("port", true);
		g_form.setDisplay("base_path",true );
		g_form.setMandatory("host",true );
		
		if (g_form.getValue("mutual_auth") == "true" && g_form.getValue("use_mid") == "true") {
			g_form.setMandatory("mid_protocol_profile", true);
			g_form.setDisplay("mid_protocol_profile", true);
			
			g_form.setMandatory("protocol_profile", false);
			g_form.setDisplay("protocol_profile", false);
			
			g_form.setMandatory("protocol", false);
			g_form.setDisplay("protocol", false);			
		} else if (g_form.getValue("mutual_auth") == "true") {
			g_form.setMandatory("mid_protocol_profile", false);
			g_form.setDisplay("mid_protocol_profile", false);
			
			g_form.setMandatory("protocol_profile", true);
			g_form.setDisplay("protocol_profile", true);
			
			g_form.setMandatory("protocol", false);
			g_form.setDisplay("protocol", false);			
		}
		else {
			g_form.setMandatory("protocol_profile", false);
			g_form.setDisplay("protocol_profile", false);

			g_form.setMandatory("mid_protocol_profile", false);
			g_form.setDisplay("mid_protocol_profile", false);
			
			g_form.setMandatory("protocol", true);			
			g_form.setDisplay("protocol", true);	
			
			g_form.setValue("protocol", "https");
		}
	}
	else {
		g_form.setMandatory("host",false );
		g_form.setMandatory("protocol_profile", false);
		g_form.setMandatory("mid_protocol_profile", false);
		g_form.setMandatory("protocol", false);
		
		g_form.setReadOnly("connection_url", false);
		
		g_form.setDisplay("mutual_auth", false);
		g_form.setDisplay("host",false );
		g_form.setDisplay("port", false);
		g_form.setDisplay("base_path",false );
		g_form.setDisplay("protocol_profile", false);
		g_form.setDisplay("mid_protocol_profile", false);
		g_form.setDisplay("protocol",false );		
	}
	
}
