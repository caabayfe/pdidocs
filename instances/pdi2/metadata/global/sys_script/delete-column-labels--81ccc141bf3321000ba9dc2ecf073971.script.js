var labels = new GlideRecord('sys_documentation');
labels.setWorkflow(false);
labels.addQuery('name', current.name);
labels.addQuery('element', current.element);
labels.query();
while(labels.next())
	labels.deleteRecord();
