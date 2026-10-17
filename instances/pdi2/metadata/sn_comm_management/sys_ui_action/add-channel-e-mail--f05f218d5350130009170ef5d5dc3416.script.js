var handlerInstance = new CommunicationManagementBridgeSNC().getHandlerInstanceByCommTaskTable(current.getRecordClassName());
var commTaskVariables = handlerInstance.getCommTaskVariables(current.comm_plan.source.getRefRecord().getRecordClassName());
var defaultTemplateId = commTaskVariables.default_email_client_template + '';
var defaultRecipientField = commTaskVariables.default_recipient_field + '';

var url = "/comm_channel_email.do?sys_id=-1&sysparm_query=comm_task="+current.sys_id+ "^email_client_template=" +defaultTemplateId+"^recipient_field=" + defaultRecipientField + "^EQ";

action.setRedirectURL(url);
action.setReturnURL(current);
