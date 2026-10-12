var table = new GlideRecord("sys_cs_context_profile");
table.get(RP.getParameterValue("sysparm_collectionID"));
action.setRedirectURL("sys_cs_context_profile_topic.do?sysparm_view=simple_chat_context_profiles&sysparm_query_override=name=" + table.name.toString() + "&sysparm_collectionID=" + RP.getParameterValue("sysparm_collectionID") + "&sysparm_collection_relationship=f7f4a08f53211010a813ddeeff7b1256&sysparm_collection=sys_cs_context_profile");
action.setReturnURL(table);
