var ProminAllowedColumns = Class.create();
ProminAllowedColumns.prototype = {
    initialize: function() {},

    process: function() {
        return this.getAllowedColumnList(currentTableName, tableName, field, entityId);
    },

    getAllowedColumnList: function(currentTableName, tableName, field, entityId) {
        var allTables = '',
            allowedFields = [],
            columnType,
            choice;
        var isSourceTypeExternalDataSet = false;
        isSourceTypeExternalDataSet = this._isSourceTypeExternalDataSet(tableName, entityId);
        if (isSourceTypeExternalDataSet) {
            return true;
        }
        var internalTypes = ["choice", "string", "boolean", "integer", "reference", "workflow"];
        if (!gs.nil(currentTableName) && currentTableName == "promin_activity_def") { // allow date/time fields only for activity def
            internalTypes.push("glide_date_time", "journal_input");
        }
        if (!gs.nil(currentTableName) && currentTableName == "promin_breakdown_field") { // allow sys_class_name fields only for breakdown def
            internalTypes.push("sys_class_name");
        }
		if (!gs.nil(currentTableName) && currentTableName == "promin_finding_def_condition") { // allow date/time fields for finding def condition
            internalTypes.push("glide_date_time");
        }
        var selectedField = '';
        if (field.includes('.')) {
            selectedField = field.split(".");
        }
        var totalLength = selectedField.length - 1;
        if (selectedField.length >= 2) {
            for (var count = 0; count < totalLength; count++) {
                var tableList = '' + new TableUtils(tableName).getTables().toString();
                var grSysDictionary = new GlideRecord("sys_dictionary");
                grSysDictionary.addQuery("name", 'IN', tableList.replace(/[\][]/g, '').replace(/ +?/g, ''));
                grSysDictionary.addQuery("element", selectedField[count]);
                grSysDictionary.addNotNullQuery("reference");
                grSysDictionary.setLimit(1);
                grSysDictionary.query();
                if (grSysDictionary.next()) {
                    tableName = grSysDictionary.getValue('reference');
                    field = selectedField[count + 1];
                }
            }
        }

        if (tableName.startsWith("ar_")) {
            allTables += new TableUtils(tableName.substring(3)).getTables().toString();
        } else {
            allTables += new TableUtils(tableName).getTables().toString();
        }
        if (allTables) {
            var grDictionary = new GlideRecord('sys_dictionary');
            grDictionary.addQuery('name', 'IN', allTables.replace(/[\][]/g, '').replace(/ +?/g, ''));
            grDictionary.addQuery('internal_type', 'IN', internalTypes);
            grDictionary.query();
            while (grDictionary.next()) {
                columnType = grDictionary.getValue('internal_type');
                if (!isSourceTypeExternalDataSet && currentTableName != 'promin_activity_def' && currentTableName != 'promin_breakdown_field') {
                    choice = grDictionary.getValue('choice');
                    if (columnType == 'string') {
                        if (choice != 1 && choice != 3) {
                            continue;
                        }
                    }
                }
                var activityField = grDictionary.getValue('element');
                if (activityField == field) {
                    return true;
                }
                allowedFields.push(activityField);

            }
        }
        if (allowedFields.length > 0 && !allowedFields.includes(field)) {
            return false;
        }
    },

    _isSourceTypeExternalDataSet: function(tableName, entityId) {
        if (entityId != '') {
            var grEntity = new GlideRecord("promin_project_entity");
            if (grEntity.get(entityId)) {
                return (grEntity.getValue("source_type") == "EXTERNAL_DATA");
            }
        }

        var grExternalDataSet = new GlideRecord("sn_po_extdata_dataset");
        if (grExternalDataSet.isValid()) {
            grExternalDataSet.addQuery("case_table", tableName);
            grExternalDataSet.query();
            if (grExternalDataSet.hasNext()) {
                return true;
            }
        }
        return false;
    },
    type: 'ProminAllowedColumns'
};
