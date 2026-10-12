/**(function executeQuery(v_table, v_query) {
    var referenceTables = [{
            table: 'sys_transaction_pattern',
            scopeColumnName: 'origin_scope'
        },
        {
            table: 'sys_script_pattern',
            scopeColumnName: 'script_scope'
        },
        {
            table: 'sysevent_pattern',
            scopeColumnName: 'event_scope'
        }
    ];

   for (var i = 0; i < referenceTables.length; i++) {
        getReferenceRecords(referenceTables[i].table, referenceTables[i].scopeColumnName);
    }

    function getReferenceRecords(table, scopeColumnName) {
        var glideRecord = new GlideRecord(table);
        glideRecord.addQuery(scopeColumnName, '!=', 'global');
        glideRecord.query();

        while (glideRecord.next()) {
            var record = {
                scope: glideRecord.getValue(scopeColumnName),
            };

            // Adding reference table to record;
            record[table] = glideRecord.getUniqueValue();
            v_table.addRow(record);
        }
    }
})(v_table, v_query);*/
