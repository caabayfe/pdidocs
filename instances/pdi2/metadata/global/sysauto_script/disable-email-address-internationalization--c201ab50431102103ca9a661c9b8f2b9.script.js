var property = new GlideRecord("sys_properties");
property.addQuery("name","glide.email_address.rfc6530.enabled");
property.query();
if(property.next()){
	property.value = false;
	property.update();
}
