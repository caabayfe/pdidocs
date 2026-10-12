function updateItAppOwnerDictionaryScope() {
    var isTableInGlobalScope = false;
    var gr = new GlideRecord('sys_db_object');
    gr.addQuery('name', 'cmdb_ci_business_app');
    gr.query();
    if (gr.next())
        if (gr.getValue('sys_scope') == 'global')
            isTableInGlobalScope = true;
    //If table is only in global scope we need to check for sys dictionary entry
    //else no issue as table and dictionary entry will be in apm scope anyway.
    if (isTableInGlobalScope) {
        gs.info('Fix Scope of APM Labels: Business App table in Global Scope');
        //Query the dictionary entry for business applications table 
        //with column it_application_owner that is in apm scope
        gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', 'cmdb_ci_business_app');
        gr.addQuery('element', 'it_application_owner');
        gr.addQuery('sys_scope.scope', 'sn_apm');
        gr.query();
        if (gr.next()) {
            gs.info('Updating the scope of sys_dictionary entry with sys_id ' + gr.sys_id + ' to global scope');
            gr.sys_scope = 'global';
            gr.update();
        }
    } else
        gs.info('Fix Scope of APM Labels: No changes needed for updating IT Application Owner field.');
}


gs.info('Fix Scope of APM Labels: Fixing scope of Business App and capability documentation files');

function updateScopeofRecord(column, table) {
    var sysDocGlideRecord = new GlideRecord('sys_documentation');
    sysDocGlideRecord.addQuery('name', table);
    sysDocGlideRecord.addQuery('element', column);
    sysDocGlideRecord.addQuery('language', 'en');
    sysDocGlideRecord.query();
    var sysDicGlideRecord = new GlideRecord('sys_dictionary');
    sysDicGlideRecord.addQuery('name', table);
    sysDicGlideRecord.addQuery('element', column);
    sysDicGlideRecord.query();
    if (sysDocGlideRecord.next() && sysDicGlideRecord.next() && sysDicGlideRecord.sys_scope == 'global' && sysDocGlideRecord.sys_scope.scope == 'sn_apm') {
        gs.info('Fix Scope of APM Labels: Updating the scope of sys_documentation entry with sys_id ' + sysDocGlideRecord.sys_id + ' to global scope');
        sysDocGlideRecord.sys_scope = 'global';
        sysDocGlideRecord.update();
    }
}

var columns = ['install_status', 'manufacturer', 'name', 'owned_by', 'sys_updated_by', 'vendor'];
for (var idx = 0; idx < columns.length; idx++) {
    updateScopeofRecord(columns[idx], 'cmdb_ci_business_app');
}

updateScopeofRecord('name', 'cmdb_ci_business_capability');
updateItAppOwnerDictionaryScope();
