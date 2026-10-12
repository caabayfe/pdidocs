var elementList = ['mail_subject', 'mail_content', 'link_label', 'confirmation_message', 'confirm_label', 'cancel_label'];
disableMandatoryAttributeOnDictionaryItem("sys_sg_button", elementList);

function disableMandatoryAttributeOnDictionaryItem(tableName, elementList) {
	var gr = new GlideRecord('sys_dictionary');

	gr.addQuery('name', tableName);
	gr.addQuery('element', 'IN', elementList);
	gr.query();

	while (gr.next()) {
		gr.setValue('mandatory', false);
		gr.setWorkflow(false);
		gr.update();
	}
}
