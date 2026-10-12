gs.info('Updating attributes for OOB Default NAP deployment');
var useAgentsInPlanner = gs.getProperty('sn_aia.use_agents_in_planner', 'true') == 'true';
var fullyAgenticModeSupported = gs.getProperty('com.glide.cs.genai.fully_agentic_java_support', 'true') == 'true';
var OOB_NAP_DEPLOYMENT_CONFIG = '36d9820f14475650f87711349c117155';
var deploymentConfigGr = new GlideRecord('sys_now_assist_deployment_config');
if(!deploymentConfigGr.isValid()) {
	gs.info('Deployment config table does not exist. This is a completely fresh install. Orchestration config update is not required');
} else if(deploymentConfigGr.get(OOB_NAP_DEPLOYMENT_CONFIG)) {
	var aiaEnabled = getAttribute(deploymentConfigGr.getUniqueValue(), 'ai_agent_skill_enabled') == 'true';
	setConfigAttribute(deploymentConfigGr.getUniqueValue(),'agentic_orchestration_enabled', fullyAgenticModeSupported && aiaEnabled);
	setConfigAttribute(deploymentConfigGr.getUniqueValue(), 'use_agents_in_planner', useAgentsInPlanner);
} else {
	gs.error('Failed to find NAP deployment config: ' + OOB_NAP_DEPLOYMENT_CONFIG);
}

function setConfigAttribute(deploymentConfigId, attribute_name, value) {
	var configAttributeGr = new GlideRecord('sys_now_assist_deployment_config_attributes');
    configAttributeGr.addQuery('deployment_config', deploymentConfigId);
    configAttributeGr.addQuery('name', attribute_name);
	configAttributeGr.setLimit(1);
    configAttributeGr.query();
    if (configAttributeGr.next()) {
		configAttributeGr.value = value;
		configAttributeGr.update();
		gs.info('Set OOB NAP default assistant config attribute ' + attribute_name + ' to ' + value);
	} else {
		gs.error('Failed to find NAP deployment config attribute: ' + attribute_name + ' for OOB NAP default assistant');
	}
}

function getAttribute(deploymentConfigSysId, name) {
	var configAttributeGr = new GlideRecord('sys_now_assist_deployment_config_attributes');
    configAttributeGr.addQuery('deployment_config', deploymentConfigSysId);
    configAttributeGr.addQuery('name', name);
	configAttributeGr.setLimit(1);
    configAttributeGr.query();
	if(configAttributeGr.next())
		return configAttributeGr.getValue('value');
	
	return null;
}
