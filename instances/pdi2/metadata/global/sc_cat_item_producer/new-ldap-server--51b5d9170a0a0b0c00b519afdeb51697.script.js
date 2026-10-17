var id = current.sys_id.toString();
		if (producer.server_provider == 'ActiveDirectory'){
   			current.listener = true;
			current.vendor = "active_directory";
		} else
			current.vendor = "other";
		current.insert();
		current.setAbortAction(true);
		var ldapUtils = new LDAPUtils();
		var ldapURLUtils = new LDAPURLUtils();
		gs.log(producer.server_provider + "-" + id);
        ldapURLUtils.createLdapServerUrl(id,producer.server_url);
		ldapUtils.createOUDefinition(id, producer.server_provider);
		producer.redirect = current.getLink(true);
