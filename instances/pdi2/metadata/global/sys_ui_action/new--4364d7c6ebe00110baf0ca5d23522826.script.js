action.setRedirectURL("sys_cs_custom_adapter_property.do?sysparm_view=create&sysparm_collectionID=" + RP.getParameterValue("sysparm_collectionID") + "&sysparm_collection_relationship=d1fe3a06eba00110baf0ca5d235228cb&sysparm_collection=sys_cs_provider");

action.setReturnURL('sys_cs_provider.do?sys_id=' + RP.getParameterValue("sysparm_collectionID"));
