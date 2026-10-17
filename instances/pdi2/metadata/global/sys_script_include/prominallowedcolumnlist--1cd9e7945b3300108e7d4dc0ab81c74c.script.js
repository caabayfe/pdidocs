var ProminAllowedColumnList = Class.create();
ProminAllowedColumnList.prototype = {
    initialize: function() {},

    process: function(tableName, currentTableName, entityId, allowStringFields, allowIntegers) {

        if (!tableName) {
            return [];
        }

        var grTable = new GlideRecord(tableName);
        var allTables = '',
            allowedFields = [],
            columnType,
            choice;

        var internalTypes = ["choice", "string", "boolean", "integer", "reference", "workflow"];
        if (!gs.nil(currentTableName) && (currentTableName == "promin_activity_def" || currentTableName == "promin_process_def")) { // allow date/time fields only for activity def
            internalTypes.push("glide_date_time", "journal_input", "journal");
        }

        if (!gs.nil(currentTableName) && currentTableName == "promin_breakdown_field") { // allow sys_class_name fields only for breakdown def
            internalTypes.push("sys_class_name");
        }

        allTables += new TableUtils(tableName).getTables().toString();
        var isSourceTypeExternalDataSet = this._isSourceTypeExternalDataSet(tableName, entityId);
        if (allTables) {
            var grDictionary = new GlideRecord('sys_dictionary');
            grDictionary.addQuery('name', 'IN', allTables.replace(/[\][]/g, '').replace(/ +?/g, ''));
            grDictionary.addQuery('internal_type', 'IN', internalTypes);
            grDictionary.addQuery('column_label', '!=', '');
            grDictionary.addNotNullQuery("column_label");
            grDictionary.query();
            while (grDictionary.next()) {
                var fieldElement = grTable.getElement(grDictionary.getValue('element'));
                if (fieldElement == null) {
                    continue;
                }
                columnType = grDictionary.getValue('internal_type');
                if (!isSourceTypeExternalDataSet && !allowStringFields && columnType == 'string' || (!allowIntegers && columnType == 'integer')) {
                    choice = grDictionary.getValue('choice');
                    if (choice != 1 && choice != 3) {
                        continue;
                    }
                }
                allowedFields.push(grDictionary.getValue('element'));
            }
        }
        return (allowedFields.length > 0) ? allowedFields : null;
    },
    _isSourceTypeExternalDataSet: function(tableName, entityId) {
        var grEntity = new GlideRecord("promin_project_entity");
        if (grEntity.get(entityId)) {
            var source = grEntity.getValue("source_type");
            return (source == "EXTERNAL_DATA" || source == "ARCHIVED_DATA");
        }

        var grExternalDataSet = new GlideRecord("sn_po_extdata_dataset");
        if (grExternalDataSet.isValid()) {
            grExternalDataSet.addQuery("case_table", tableName);
            grExternalDataSet.query();
            return grExternalDataSet.hasNext();
        }
        return false;
    },

    type: 'ProminAllowedColumnList'
};
