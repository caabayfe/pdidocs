var gr = new GlideRecord('sys_properties');
gr.addQuery('name','skip.ip_expansion_for_service_mapping');
gr.query();

if(gr.next() && gr.getValue("value") == "true") {
	var propGr = new GlideRecord('sys_properties');
	propGr.addQuery('name','sn.adm.ip_expansion_limit');
	propGr.query();
	if(propGr.next()) {
		propGr.setValue("value", "0");
		propGr.update();
	}
}
