action.setRedirectURL("sys_cs_provider_application.do?sysparm_view=create&sysparm_collectionID=" + RP.getParameterValue("sysparm_collectionID") + "&sysparm_collection_relationship=bb28806a53ba5010ad82ddeeff7b129b&sysparm_collection=sys_cs_provider");

action.setReturnURL('sys_cs_provider.do?sys_id=' + RP.getParameterValue("sysparm_collectionID"));
