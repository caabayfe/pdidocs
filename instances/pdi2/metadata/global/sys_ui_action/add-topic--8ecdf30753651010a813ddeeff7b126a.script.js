var table = new GlideRecord("sys_cs_context_profile");
table.get(RP.getParameterValue("sysparm_collectionID"));
action.setRedirectURL("sys_cs_context_profile_promotion.do?sysparm_view=simple_chat_context_profiles&sysparm_query_override=name=" + table.name.toString() + "&sysparm_collectionID=" + RP.getParameterValue("sysparm_collectionID") + "&sysparm_collection_relationship=7e903f0f53251010a813ddeeff7b1292&sysparm_collection=sys_cs_context_profile");
action.setReturnURL(table);
