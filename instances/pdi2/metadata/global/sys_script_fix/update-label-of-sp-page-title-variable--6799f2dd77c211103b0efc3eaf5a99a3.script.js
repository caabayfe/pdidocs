if (!pm.isZboot()) {
	gs.info('Updating label for the table "sp_page_title_variable" from "Dynamic page title variables" to "Dynamic page variables"');
	var glideRecord = new GlideRecord('sys_db_object');
	glideRecord.addQuery('name', '=', 'sp_page_title_variable');
	glideRecord.query();
	if(glideRecord.next()) {
		glideRecord.setValue('label', 'Dynamic page variables');
		glideRecord.update();
	}
}
