var script = "javascript:l = new LDAPUtils();";
script += "l.getTargets('" + parent.sys_id.toString() + "');";
current.addQuery('ldap_target', script)
current.addQuery('type', 'LDAP');
