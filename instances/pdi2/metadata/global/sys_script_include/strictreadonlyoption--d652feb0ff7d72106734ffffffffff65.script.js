var StrictReadOnlyOption = Class.create();
StrictReadOnlyOption.prototype = {
    initialize: function(dryRun) {
        this.dryRun = dryRun;
    },

    setClientScriptModifiableWhereAffected: function() {
        var scanItems = [
            { searchTable: 'sys_script_client', tableField: 'table', searchField: 'script' },
            { searchTable: 'sys_ui_action', tableField: 'table', searchField: 'script' },
            { searchTable: 'sys_ui_policy', tableField: 'table', searchField: 'script_true' },
            { searchTable: 'sys_ui_policy', tableField: 'table', searchField: 'script_false' },
            { searchTable: 'sys_declarative_action_assignment', tableField: 'table', searchField: 'client_script' },
        ];

        for (var i = 0; i < scanItems.length; i++) {
            this.searchResults(scanItems[i]);
        }
    },

    searchResults: function(scanItem) {
        const gFormSetVal = 'g_form.setValue('
        const gFormClearVal = 'g_form.clearValue('
        var searchTable = scanItem.searchTable;
        var tableField = scanItem.tableField;
        var searchField = scanItem.searchField;

        var gr = new GlideRecord(searchTable);
        gr.addQuery(searchField, 'CONTAINS', gFormSetVal).addOrCondition(searchField, 'CONTAINS', gFormClearVal);
        gr.addNotNullQuery(tableField);
        gr.query();

        while (gr.next()) {
            var script = gr.getValue(searchField);
            var table = gr.getValue(tableField);
            if (table.startsWith(searchField, 'x_') || table.startsWith('u_'))
                continue;

            var fields = this.getFieldsInScript(script);

            for (var i = 0; i < fields.length; i++) {
                var field = fields[i];
                if (field.startsWith('u_'))
                    continue;

                if (!this.isStrictReadOnly(field, table))
                    continue;


                var tables = GlideDBObjectManager.getTables(table);
                if (tables.size() < 2) {
                    var dictionaryGr = this.getDictionary(table, field);
                    if (dictionaryGr)
                        this.updateReadOnlyOptionToModifiable(dictionaryGr, searchTable, gr.getUniqueValue(), table, field);
                    continue;
                }

                var tableFieldDefinedOn = this.getTableFieldDefinedOn(tables, field);
                if (tableFieldDefinedOn == table) {
                    var dictionaryGr = this.getDictionary(table, field);
                    if (dictionaryGr)
                        this.updateReadOnlyOptionToModifiable(dictionaryGr, searchTable, gr.getUniqueValue(), table, field);
                    continue;
                }

                var dictionaryOverride = this.findMatchingOverride(table, field);
                if (dictionaryOverride) {
                    this.updateReadOnlyOptionToModifiable(dictionaryOverride, searchTable, gr.getUniqueValue(), table, field);
                    continue;
                }

                var dictionaryGr = this.getDictionary(tableFieldDefinedOn, field);
                if (dictionaryGr)
                    this.updateReadOnlyOptionToModifiable(dictionaryGr, searchTable, gr.getUniqueValue(), tableFieldDefinedOn, field);
            }
        }
    },

    updateReadOnlyOptionToModifiable: function(dictionaryGr, scriptDefinitionTable, scriptSysId, table, field) {
        if (!this.dryRun) {
            if (dictionaryGr.getTableName() == "sys_dictionary_override")
                dictionaryGr.setValue('read_only_option_override', true);
            dictionaryGr.setValue('read_only_option', 'client_script_modifiable');
            dictionaryGr.update();

            var logMessage = 'A field with a read_only_option=strict_read_only is being modified by a client script. The ' +
                'read_only_option value will be set to client_script_modifiable to prevent regression. ' +
                'script_definition_table=' + scriptDefinitionTable +
                ', script_sys_id=' + scriptSysId +
                ', table=' + table +
                ', field=' + field +
                ', file_updated=' + dictionaryGr.getValue("sys_update_name");

            gs.log(logMessage, 'ReadOnlyOptionPostUpgrade');
        } else {
            var dryRunMsg = 'Affected dictionary file: \n' +
                '  affected_dictionary=' + dictionaryGr.getValue("sys_update_name") +
                '\n    table=' + table +
                '\n    field=' + field +
                '\n    script_sys_id=' + scriptSysId +
                '\n    script_definition_table=' + scriptDefinitionTable;

            gs.log(dryRunMsg, 'ReadOnlyOptionPostUpgrade');
        }
    },

    findMatchingOverride: function(table, field) {
        var tables = GlideDBObjectManager.getTables(table);
        if (tables.size() < 2)
            return null;

        for (var i = 0; i < tables.size(); i++) {
            var parentTable = tables.get(i);
            var override = this.getDictionaryOverride(parentTable, field);
            if (override)
                return override;
        }

        return null;
    },

    getDictionaryOverride: function(table, field) {
        var sysDictionaryOverrideGr = new GlideRecord("sys_dictionary_override");
        sysDictionaryOverrideGr.addQuery("name", table);
        sysDictionaryOverrideGr.addQuery("element", field);
        sysDictionaryOverrideGr.query();

        return sysDictionaryOverrideGr.next() ? sysDictionaryOverrideGr : null;
    },

    getDictionary: function (table, field) {
        var dictionaryGr = new GlideRecord("sys_dictionary");
        dictionaryGr.addQuery("name", table);
        dictionaryGr.addQuery("element", field);
        dictionaryGr.addQuery("read_only_option", 'strict_read_only');
        dictionaryGr.query();

        return dictionaryGr.next() ? dictionaryGr : null;
    },

    getTableFieldDefinedOn: function(tables, fields) {
        var dictionaryGr = new GlideRecord("sys_dictionary");
        dictionaryGr.addQuery("name", tables);
        dictionaryGr.addQuery("element", fields);
        dictionaryGr.query();

        return dictionaryGr.next() ? dictionaryGr.getValue('name') : null;
    },

    isStrictReadOnly: function(field, table) {
        var td = GlideTableDescriptor.get(table);
        if (!td)
            return false;
        var ed = td.getElementDescriptor(field);

        if (ed == null)
            return false;

        return ed.getReadOnlyOption() == 'strict_read_only';
    },

    getFieldsInScript: function(script) {
        var regex = /g_form\.(?:setValue|clearValue)\s*\(\s*['"]([^'"]+)['"]/g;

        var fields = [];
        var match;

        while ((match = regex.exec(script)) !== null) {
            fields.push(match[1]);
        }

        if (fields.length === 0)
            return fields;

        return this.removeDupes(fields);
    },

    removeDupes: function(fields) {
        return fields.filter(function(item, index) {
            return fields.indexOf(item) === index;
        });
    },

    type: 'StrictReadOnlyOption'
};
