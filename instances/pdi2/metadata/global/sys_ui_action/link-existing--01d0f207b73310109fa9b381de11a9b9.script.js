var geniusResultConfigurationId = action.getGlideURI().get('sysparm_collectionID');

/* Go to the M2M page to link a model to this config */
action.setRedirectURL('ais_genius_result_configuration_sys_nlu_model_m2m.do?sys_id=-1&sysparm_query=genius_result_configuration=' + geniusResultConfigurationId);

/* Return to this configuration when done */
var configGR = new GlideRecord("ais_genius_result_configuration");
configGR.get(geniusResultConfigurationId);
action.setReturnURL(configGR);
