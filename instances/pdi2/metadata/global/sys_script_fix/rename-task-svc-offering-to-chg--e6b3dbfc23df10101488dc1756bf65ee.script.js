var propGr = new GlideRecord('sys_properties');
propGr.addQuery('name', 'com.snc.task.populate_service_offering');
propGr.query();

if (propGr.next()) {
	propGr.setValue('name', 'com.snc.change_request.populate_service_offering');
	propGr.update();
}
