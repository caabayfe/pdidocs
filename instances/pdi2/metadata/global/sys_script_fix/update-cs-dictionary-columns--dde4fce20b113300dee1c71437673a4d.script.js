var updateConvTask = new GlideRecord('sys_dictionary');
updateConvTask.addQuery('name', 'sys_cs_conversation_task');
updateConvTask.addQuery('element', 'topic_type');
updateConvTask.query();
if (updateConvTask.next()) {
	updateConvTask.setValue('column_label', 'Topic');
	updateConvTask.update();
}

var updateConsumerAccount = new GlideRecord('sys_dictionary');
updateConsumerAccount.addQuery('name', 'sys_cs_consumer_account');
updateConsumerAccount.addQuery('element', 'consumer');
updateConsumerAccount.query();
if (updateConsumerAccount.next()) {
	updateConsumerAccount.setValue('display', 'true');
	updateConsumerAccount.update();
}
