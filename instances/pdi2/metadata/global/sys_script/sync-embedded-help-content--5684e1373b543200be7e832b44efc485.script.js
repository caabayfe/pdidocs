var helpContent = new GlideRecord('sys_embedded_help_content');
helpContent.addQuery('role',current.role);
helpContent.query();
while (helpContent.next()) {
	helpContent.role_order = current.order;
	helpContent.update();
}
