changeColumnValues('ds_document', 'application');
changeColumnValues('ds_document_lists', 'application');

function changeColumnValues(table, column) {
    var globalSysId = 'global';

    var rec = new GlideRecord(table);
    rec.addQuery(column, '');
    rec.setValue(column, globalSysId);
    rec.updateMultiple();
}

/**
 * Enables CRUD access (create, read, update, delete) for specified tables.
 * @param {Array} tableNames - List of table names to update in sys_db_object.
 */
function enableCRUDForTables(tableNames) {
    var gr = new GlideRecord('sys_db_object');
    gr.addQuery('name', 'IN', tableNames.join(','));
    gr.addEncodedQuery('create_access=false^ORread_access=false^ORupdate_access=false^ORdelete_access=false');
    gr.query();

    if (gr.hasNext()) {
        gr.setValue('create_access', true);
        gr.setValue('read_access', true);
        gr.setValue('update_access', true);
        gr.setValue('delete_access', true);

        gr.updateMultiple();
        gs.debug('[FixScript] Enabled CRUD access for table(s).');
    } else {
        gs.debug('[FixScript] All listed tables already have CRUD access enabled.');
    }
}

// Call enableCRUDForTables with list of tables to enable CRUD
enableCRUDForTables([
    'ds_document_references',
    'ds_document_permission',
    'ds_document_user_can_access_mtom',
    'ds_document_uc_can_access_mtom',
    'ds_document_ug_can_access_mtom',
    'ds_document_ur_can_access_mtom'
]);
