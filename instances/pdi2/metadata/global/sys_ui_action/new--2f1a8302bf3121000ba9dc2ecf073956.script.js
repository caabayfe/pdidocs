var table = new GlideRecord("sys_db_object");
table.get(RP.getParameterValue("sysparm_collectionID"));
action.setRedirectURL("sys_dictionary.do?sysparm_query_override=name=" + table.name.toString());
action.setReturnURL(table);
