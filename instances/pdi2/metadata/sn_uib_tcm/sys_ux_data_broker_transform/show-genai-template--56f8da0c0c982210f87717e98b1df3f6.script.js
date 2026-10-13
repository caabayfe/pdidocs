function transform(input) {
	var constants = {
        NOW_ASSIST_ITSM_PLUGIN: 'com.sn.itsm.gen.ai',
        MIM_EMAIL_COMM_SKILL: '752f06c03b07d2107630a29a04e45a60'
    };
    var output = {
		"skill": "",
		"response": false
	};
    try {
        if (!input || !input.table || !input.sys_id) return output;
        var handlerInstance = new sn_comm_management.CommunicationManagementBridgeSNC().getHandlerInstance(input.table);
        var taskTable = handlerInstance.getCommTaskInstanceForTask();
        if (taskTable === "incident_alert_task" && GlidePluginManager.isActive(constants.NOW_ASSIST_ITSM_PLUGIN)) {
            output.response = new sn_itsm_gen_ai.NowAssistItsmGenAIUtils().userCanExecuteInProductSkill(constants.MIM_EMAIL_COMM_SKILL, taskTable, input.sys_id, "emailTemplate") || false;
        }
        output.skill =  constants.MIM_EMAIL_COMM_SKILL;	
        return output;
    } catch (e) {
        return output;
    }
}
