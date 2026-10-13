var recipientField = new sn_comm_management.CommunicationManagementUtil().getDefaultEmailRecipientField(current.comm_plan_definition.table + '')
var url = "/comm_channel_def_email.do?sys_id=-1&sysparm_query=comm_task_definition="+current.sys_id+"^recipient_field="+ recipientField + "^EQ";
action.setRedirectURL(url);
action.setReturnURL(current);
