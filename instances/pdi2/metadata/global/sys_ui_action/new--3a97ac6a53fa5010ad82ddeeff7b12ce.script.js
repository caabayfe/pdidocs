action.setRedirectURL("sys_cs_custom_adapter_config.do?sysparm_view=create&sysparm_collectionID=" + RP.getParameterValue("sysparm_collectionID") + "&sysparm_collection_relationship=b7ef9db253fe5010ad82ddeeff7b12e2&sysparm_collection=sys_cs_provider");

action.setReturnURL('sys_cs_provider.do?sys_id=' + RP.getParameterValue("sysparm_collectionID"));
