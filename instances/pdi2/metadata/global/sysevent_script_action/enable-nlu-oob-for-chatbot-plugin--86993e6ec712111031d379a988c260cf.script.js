var SERVICENOW_NLU_DRIVER_ID = '64c023c17300330021a044764df6a70e';
var GENERAL_SETTINGS_SYS_ID = '586237553b1323009cbbcea234efc42f';

var gr = new GlideRecord('sys_cs_general_settings');
if (gr.get(GENERAL_SETTINGS_SYS_ID)) {
	gr.setValue('auto_select_prompt_enabled_mid', true);
	gr.setValue('nlu_enabled', true);
	gr.setValue('nlu_driver', SERVICENOW_NLU_DRIVER_ID);
	gr.update();
}

gs.info('Enabled ServiceNow NLU for newly activated chatbot plugin');
