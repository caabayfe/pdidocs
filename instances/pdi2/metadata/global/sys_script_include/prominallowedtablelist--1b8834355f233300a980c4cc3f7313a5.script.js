var ProminAllowedTableList = Class.create();
ProminAllowedTableList.prototype = {

    process: function() {
        return this.getAllowedTableList([]);
    },
    getAllowedTableList: function(tableList, sourceType, includeLabels) {
        var allowedTables = [],
            tableName,
            tableLabel,
            grTable,
            currentTable = "",
            arrayUtil = new ArrayUtil();
        try {
            currentTable = current.getTableName();
        } catch (error) {
            //current object is not defined
        }

        var grDbObject = new GlideRecord('sys_db_object');
        this._addTableFilters(grDbObject, sourceType);
        if (tableList.length > 0) {
            grDbObject.addQuery("name", "IN", tableList.toString());
        }
        grDbObject.setWorkflow(false);
        grDbObject.query();
        while (grDbObject.next()) {
            tableName = grDbObject.getValue('name');
            tableLabel = grDbObject.getValue('label');
            if (gs.nil(tableName)) {
                continue;
            }
            if (gs.nil(tableLabel)) {
                tableLabel = tableName;
            }
            if (!includeLabels) {
                allowedTables.push(tableName);
            } else {
                allowedTables.push({
                    name: tableName,
                    label: tableLabel,
                });
            }
        }
        if (currentTable == 'promin_process_def') {
            allowedTables = arrayUtil.concat(allowedTables, this._getExternalDataSetCaseTables());
        }
        return allowedTables;
    },
    getAllowedTableListWithSearch: function(sourceType, searchTerm) {
        var allowedTables = [],
            tableName,
            tableLabel,
            grTable,
            currentTable = "",
            arrayUtil = new ArrayUtil();
        try {
            currentTable = current.getTableName();
        } catch (error) {
            //current object is not defined
        }
        var grDbObject = new GlideRecord('sys_db_object');
        this._addTableFilters(grDbObject, sourceType, searchTerm);
        grDbObject.orderBy("label");
        grDbObject.setLimit(15);
        grDbObject.setWorkflow(false);
        grDbObject.query();
        while (grDbObject.next()) {
            tableName = grDbObject.getValue('name');
            tableLabel = grDbObject.getValue('label');
            if (gs.nil(tableName)) {
                continue;
            }
            if (gs.nil(tableLabel)) {
                tableLabel = tableName;
            }
            allowedTables.push({
                name: tableName,
                label: tableLabel,
            });
        }
        if (currentTable == 'promin_process_def') {
            allowedTables = arrayUtil.concat(allowedTables, this._getExternalDataSetCaseTables());
        }

        // Calculate row count
        var ga = new GlideAggregate('sys_db_object');
        this._addTableFilters(ga, sourceType, searchTerm);
        ga.query();

        return {
            tables: allowedTables,
            rowCount: ga.getRowCount(),
        };
    },
    _addTableFilters: function(gr, sourceType, searchTerm) {
        var permittedSysTables = gs.getProperty('glide.ui.permitted_tables', '').split(',');
        var agenticAiTables = ['sn_aia_execution_plan', 'sn_aia_execution_task'];
        if (sourceType == "ARCHIVED_DATA") {
            gr.addQuery("name", "STARTSWITH", "ar_");
        } else if (sourceType == "AGENTIC_AI_DATA") {
            gr.addQuery("name", agenticAiTables[0]);
        }
        var nameNotInTables = [].concat(this._getExternalDataSetImportAndAuditTables());
        if (sourceType != "AGENTIC_AI_DATA") {
            nameNotInTables = nameNotInTables.concat(agenticAiTables);
        }
        gr.addQuery("name", "NOT IN", nameNotInTables);
        gr.addQuery("name", "!=", "sys_audit");
        gr.addQuery("name", "NOT LIKE", "promin_%");
        var qc = gr.addQuery("name", "NOT LIKE", "sys_%");
        qc.addOrCondition("name", "IN", permittedSysTables);
        if (!gs.nil(searchTerm)) {
            gr.addEncodedQuery("labelSTARTSWITH" + searchTerm + "^ORnameSTARTSWITH" + searchTerm);
        }
    },
    _getExternalDataSetCaseTables: function() {
        var tableName = "",
            allowedTables = [],
            gSecurityManager = new GlideSecurityManager();
        var grDataSet = new GlideRecord("sn_po_extdata_dataset");
        if (grDataSet.isValid()) {
            grDataSet.addNotNullQuery("case_table");
            grDataSet.query();
            while (grDataSet.next()) {
                tableName = grDataSet.getValue('case_table');
                grTable = new GlideRecord(tableName);
                if (grTable.isValid()) {
                    if (gSecurityManager.tableLevelACLAllow(grTable, "read")) {
                        allowedTables.push(tableName);
                    }
                }
            }
        }
        return allowedTables;
    },
    _getExternalDataSetImportAndAuditTables: function() {
        var tableList = [];
        var grDataSet = new GlideRecord("sn_po_extdata_dataset");
        if (grDataSet.isValid()) {
            var grTables = new GlideRecord("sys_db_object");
            var qc = grTables.addQuery("name", "IN", "sn_po_extdata_import,sn_po_extdata_audit");
            qc.addOrCondition("super_class.name", "IN", "sn_po_extdata_import,sn_po_extdata_audit");
            grTables.query();
            while (grTables.next()) {
                tableList.push(grTables.getValue("name"));
            }
        }
        return tableList;
    },

    tableLevelACLAllow: function(grTable, operation) {
        return new GlideSecurityManager().tableLevelACLAllow(grTable, operation);
    },
    type: 'ProminAllowedTableList'
};
