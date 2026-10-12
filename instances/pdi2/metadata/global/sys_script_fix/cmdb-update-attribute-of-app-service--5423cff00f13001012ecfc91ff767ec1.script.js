var glideRecord = new GlideRecord('sys_dictionary');            
glideRecord.addQuery('name', 'cmdb_ci_service');
glideRecord.addQuery('element', 'number');
glideRecord.query();            
while (glideRecord.next()) {
    glideRecord.setValue('read_only', 'false');
    glideRecord.update();
}
