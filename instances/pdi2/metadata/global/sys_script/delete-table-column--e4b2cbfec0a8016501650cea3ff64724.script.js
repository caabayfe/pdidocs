(function executeRule(current, previous /*null when async*/ ) {
    var tableName = current.name.toString();
    var columnName = current.element.toString();
    if (GlideTableDescriptor.fieldExists(tableName, columnName)) {
        var duplicates = new GlideRecord('sys_dictionary');
        duplicates.addQuery('name', tableName);
        duplicates.addQuery('element', columnName);
        duplicates.query();
        if (!duplicates.next()) {
            var transaction = GlideTransaction.get();
            var previousCancelState = null;
            try {
                if (transaction != null) {
                    previousCancelState = transaction.isUncancelable();
                    transaction.setCannotCancel(true);
                }
                gs.dropColumnQuick(tableName, columnName);

                // cleaning up sys_documentation records if we're dropping a column on TPP tables
                if (GlideDBObjectManager.isPartitionedTable(tableName)) {
                    var childTables = GlideDBObjectManager.get().getTableExtensions(tableName);
                    if (childTables.size() === 0)
                        return;
                    var it = childTables.iterator();
                    while (it.hasNext()) {
                        var targetChild = it.next();
                        deleteChildSysRecords('sys_documentation', targetChild, columnName);
                    }
                }

            } finally {
                if (transaction != null && previousCancelState != null)
                    transaction.setCannotCancel(previousCancelState);
            }
        }
    } else {
        var isFunction = current.function_field;
        if (isFunction && GlideDBObjectManager.isPartitionedTable(tableName)) {
            childTables = GlideDBObjectManager.get().getTableExtensions(tableName);
            if (childTables.size() === 0)
                return;
            it = childTables.iterator();
            while (it.hasNext()) {
                targetChild = it.next();
                deleteChildSysRecords('sys_dictionary', targetChild, columnName);
                deleteChildSysRecords('sys_documentation', targetChild, columnName);
            }
        }
    }

    function deleteChildSysRecords(recordTableName, tableName, columnName) {
        var sysGR = GlideRecord(recordTableName);
        sysGR.setWorkflow(false);
        sysGR.addQuery('name', tableName);
        sysGR.addQuery('element', columnName);
        sysGR.query();
        while (sysGR.next())
            sysGR.deleteRecord();
    }
})(current, previous);
