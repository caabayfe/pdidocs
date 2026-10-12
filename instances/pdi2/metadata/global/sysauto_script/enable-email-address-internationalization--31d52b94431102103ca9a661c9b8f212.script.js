var gr = new GlideRecordSecure("sys_email_account");
gr.addEncodedQuery("type=smtp^active=true");
gr.query();
while(gr.next()){
	var isSMTPUTF8Supported = new SNC.SMTPUTF8Support().detectUTF8(gr);
	if(isSMTPUTF8Supported){
		var property = new GlideRecord("sys_properties");
		property.addQuery("name","glide.email_address.rfc6530.enabled");
		property.query();
		if(property.next()){
			property.value = true;
			property.update();
		}
	}
}
