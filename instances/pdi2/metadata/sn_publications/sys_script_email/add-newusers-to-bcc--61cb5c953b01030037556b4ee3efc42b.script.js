(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

 			var newUsers = event.parm2;
			var userDelta = new GlideRecord("sn_publications_publication_contact_m2m");
			userDelta.addQuery("publication",current.getUniqueValue());
			
	        userDelta.addQuery("user.sys_id","IN",newUsers);
	        //userDelta.addQuery("user.sys_id","IN",newUsers);
			userDelta.query();
			while(userDelta.next()){
		       email.addAddress("bcc",userDelta.getValue('email_address'),userDelta.getValue('name'));
			}

})(current, template, email, email_action, event);
