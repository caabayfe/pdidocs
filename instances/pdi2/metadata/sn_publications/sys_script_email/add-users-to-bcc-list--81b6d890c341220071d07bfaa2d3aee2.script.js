(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
										   /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
										   /* Optional GlideRecord */ event) {

	// Add your code here
	if(event.sys_id){
			var user = new GlideRecord("sn_publications_publication_contact_m2m");
			user.addQuery("publication",current.getUniqueValue());
			user.query();
			while(user.next()){
				email.addAddress("bcc",user.getValue('email_address'),user.getValue('name'));
			}
	}
	
})(current, template, email, email_action, event);
