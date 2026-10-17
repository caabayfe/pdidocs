var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstanceByCommTaskTable(current.getRecordClassName());
var commTaskVariables = handlerInstance.getCommTaskVariables();
var defaultTemplateId = commTaskVariables.default_sms_template;

var url = "/comm_channel_sms.do?sys_id=-1&sysparm_query=comm_task="+current.sys_id+ "^notify_sms_template=" +defaultTemplateId+"^EQ";

action.setRedirectURL(url);
action.setReturnURL(current);
