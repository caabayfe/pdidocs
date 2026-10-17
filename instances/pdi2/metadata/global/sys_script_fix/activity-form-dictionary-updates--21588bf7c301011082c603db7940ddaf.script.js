(function() {
    if (pm.isZboot())
        return;

    var activityTables = getActivityTables();
    gs.log('Running fix script "Activity Form Dictionary Updates"', 'ActivityFormDictionaryUpdates');

    activityTables.forEach(updateActivityShard);

    function updateActivityShard(shardName) {
        truncateTable(shardName);
        updateDocumentId(shardName);
        updateEventCreatedBy(shardName);
        updatePayload(shardName);
    }

    function updateDocumentId(table) {
        var docIdDictionary = getDictionary(table, 'document_id');
        if (docIdDictionary) {
            gs.log('Updating document_id internal type to Document ID on shard ' + table, 'ActivityFormDictionaryUpdates');
            docIdDictionary.setValue('internal_type', 'document_id');
            docIdDictionary.setValue('use_dependent_field', true);
            docIdDictionary.setValue('dependent', 'document_table');
            docIdDictionary.update();
        }
    }

    function updateEventCreatedBy(table) {
        var eventCreatedByDictionary = getDictionary(table, 'event_created_by');
        if (eventCreatedByDictionary) {
            gs.log('Updating field event_created_by internal type to String on shard ' + table, 'ActivityFormDictionaryUpdates');
            eventCreatedByDictionary.setValue('internal_type', 'string');
            eventCreatedByDictionary.setValue('max_length', 100);
            eventCreatedByDictionary.update();
        }
    }

    function updatePayload(table) {
        var payloadDictionary = getDictionary(table, 'payload');
        if (payloadDictionary) {
            gs.log('Updating field payload internal type to String on shard ' + table, 'ActivityFormDictionaryUpdates');
            payloadDictionary.setValue('internal_type', 'string');
            payloadDictionary.setValue('max_length', 8000);
            payloadDictionary.update();
        }
    }

    var userSysIdDictionary = getDictionary('sys_activity_supplemental', 'user_sys_id');
    if (userSysIdDictionary) {
        gs.log('Updating field user_sys_id internal type to Reference', 'ActivityFormDictionaryUpdates');
        userSysIdDictionary.setValue('internal_type', 'reference');
        userSysIdDictionary.setValue('reference', 'sys_user');
        userSysIdDictionary.update();
    }

    var suppPayloadDictionary = getDictionary('sys_activity_supplemental', 'payload');
    if (suppPayloadDictionary) {
        gs.log('Updating field payload internal type to String', 'ActivityFormDictionaryUpdates');
        suppPayloadDictionary.setValue('internal_type', 'string');
        suppPayloadDictionary.setValue('max_length', 4000);
        suppPayloadDictionary.update();
    }

    function getDictionary(table, field) {
        var dictionaryGr = new GlideRecord('sys_dictionary');
        dictionaryGr.addQuery('name', table);
        dictionaryGr.addQuery('element', field);
        dictionaryGr.query();

        return dictionaryGr.next() ? dictionaryGr : null;
    }

    function truncateTable(table) {
        var tableRotation = new SncTableRotation(table);
        tableRotation.truncateTable(table);
    }

    function getActivityTables() {
        var tableRotation = new SncTableRotation('sys_activity');
        var tables = tableRotation.getTablesInRotation();

        var tablesArray = ['sys_activity'];

        for (var i = 0; i < tables.size(); i++) {
            tablesArray.push(tables.get(i));
        }
        return tablesArray;
    }
})();
