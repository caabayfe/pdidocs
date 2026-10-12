var AisMigrationTitleTextHandler = Class.create();
AisMigrationTitleTextHandler.prototype = {
    FALLBACK_FIELD_LIST: ['number', 'u_number', 'name', 'u_name', 'sys_id'], // Ordered list of fields to use for mappings if all else fails

    initialize: function(migrationSysID) {
        this.migrationSysID = migrationSysID;
        this.logger = new AisMigrationLogger(migrationSysID, 'TitleTextMapper');
    },

    createTitleTextMappings: function(table, indexedSourceSysID) {
        var titleTextFields = this._getTitleTextFields(table);
        var titleField = titleTextFields[0];
        var textField = titleTextFields[1];

        if (titleField)
            this._insertFieldMapToAttribute(indexedSourceSysID, table, titleField, 'title');
        if (textField)
            this._insertFieldMapToAttribute(indexedSourceSysID, table, textField, 'text');

        //add sort option attribute
        this._insertFieldMapToAttribute(indexedSourceSysID, table, 'sys_updated_on', 'sort_by_date');
    },

    _insertFieldMapToAttribute: function(aisIndexSourceId, table, field, value) {
        var aisAttributeGR = new AisMigrationRecord(this.migrationSysID, 'ais_datasource_field_attribute');
        aisAttributeGR.setValue('attribute', 'f734a634c7320010d1cfd9795cc26094'); // map-to attribute sys_id
        aisAttributeGR.setValue('datasource', aisIndexSourceId);
        aisAttributeGR.setValue('field', field);
        aisAttributeGR.setValue('value', value);
        aisAttributeGR.setValue('source', table);
        aisAttributeGR.insert();
    },

    _getTitleTextFields: function(tableName) {
        var title;
        var text;

        // Option 1: Get the display field for the table
        var displayField = this._getDisplayFieldFromDictionary(tableName);
        if (displayField) {
            this.logger.info('Found display field: ' + displayField + ' for table: ' + tableName);
            title = displayField;
        }

        // Option 2 : Get fields from the text search view
        var fieldsFromView = this._getFieldsFromTextSearchView(tableName);

        if (fieldsFromView) {
            if (!title) {
                title = fieldsFromView[0];
                text = fieldsFromView[1];
            } else {
                text = fieldsFromView[0];
            }
        }

        if (title && text) { // if we found both, we need to verify they are distinct
            if (title === text)
                text = null; // give preference to title
            else {
                this.logger.info('Mapping fields for table: ' + tableName + ' title: ' + title + ' text: ' + text);
                // if they are distinct fields, we are done
                return [title, text];
            }
        }

        // Option 3: Get fields from the hard-coded list
        var i = 0;
        var gr = new GlideRecord(tableName);

        while (i < this.FALLBACK_FIELD_LIST.length) {
            var fieldName = this.FALLBACK_FIELD_LIST[i];
            i++;
            if (gr.isValidField(fieldName)) {
                if (!title) { // Assign the title first
                    title = fieldName;
                    continue;
                }

                if (!text && fieldName != title) {
                    text = fieldName;
                    break;
                }
            }
        }

        return [title, text];
    },

    _getDisplayFieldFromDictionary: function(tableName) {
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', tableName);
        gr.addQuery('display', true);
        gr.query();
        if (!gr.next())
            return;

        return gr.getValue('element');
    },

    _getFieldsFromTextSearchView: function(tableName) {
        var textSearchListId = this._getTextSearchListId(tableName);
        if (!textSearchListId)
            return;

        return this._getFieldsFromElementList(tableName, textSearchListId);
    },

    /*
    A view contains multiple lists, each of which are tied to a table. Need to find the list that corresponds to the table we are interested in
    */
    _getTextSearchListId: function(tableName) {
        var uiListGr = new GlideRecord('sys_ui_list');
        uiListGr.addQuery('view', '0c029fc00a0a0b2c001aa3d4ed9f69e8'); // text_search view sysId
        uiListGr.addQuery('name', tableName);
        uiListGr.query();

        if (!uiListGr.next())
            return;

        return uiListGr.getUniqueValue();
    },

    /**
    A list contains elements, which are fields from the mapped table. The position field determines the order in which they are displayed
    */
    _getFieldsFromElementList: function(tableName, textSearchListID) {
        var fields = [];

        var uiListElementsGr = new GlideRecord('sys_ui_list_element');
        uiListElementsGr.addQuery('list_id', textSearchListID);
        uiListElementsGr.orderBy('position');
        uiListElementsGr.query();

        if (!uiListElementsGr.hasNext())
            return;

        while (uiListElementsGr.next())
            fields.push(uiListElementsGr.getValue('element'));

        return fields;
    },

    createDotWalkMapping: function(table, indexedSourceSysID, condition) {
        var fieldValueArr = this._getFieldAndValue(condition);

        for (var i in fieldValueArr) {
            var fieldValue = fieldValueArr[i].toString();

            var gr = new GlideRecord(table);
            if (gr.isValidField(fieldValue.split(".")[0])) {
                var aisAttributeGR = new AisMigrationRecord(this.migrationSysID, 'ais_datasource_field_attribute');
                aisAttributeGR.setValue('attribute', '2d45349173101010170b56b80ff6a7c8'); // dot_walk_fields attribute sys_id
                aisAttributeGR.setValue('datasource', indexedSourceSysID);
                aisAttributeGR.setValue('field', fieldValue.substring(0, fieldValue.indexOf(".")));
                aisAttributeGR.setValue('value', fieldValue.substring(fieldValue.indexOf(".") + 1, fieldValue.length));
                aisAttributeGR.setValue('source', table);
                aisAttributeGR.insert();
            }
        }
    },

    _getFieldAndValue: function(condition) {
        var conditions = condition.split("^");
        var arr = [];

        for (var i in conditions) {
            var field, value = '';

            if (conditions[i].toString().includes("javascript"))
                conditions[i] = conditions[i].toString().split("javascript")[0];

            if (conditions[i].toString().includes(".")) {
                var fieldValue = conditions[i].toString().split(".");

                var pos = this._getField(fieldValue[0]);
                if (pos > 1)
                    field = fieldValue[0].substr(pos, fieldValue[0].length);
                else
                    field = fieldValue[0];

                if (fieldValue.length > 2) {
                    for (var f = 1; f < fieldValue.length; f++) {
                        var val = fieldValue[f];

                        if (f == fieldValue.length - 1) {
                            var dPos = this._getValue(val);
                            val = val.substring(0, dPos);
                        }
                        value += val + '.';
                    }
                    value = value.substr(0, value.length - 1);
                } else {
                    var pos1 = this._getValue(fieldValue[1]);
                    value = fieldValue[1].substring(0, pos1);
                }

                if (arr.length > 0) {
                    for (var a in arr) {
                        if (arr[a].toString().startsWith(field + '.')) {
                            arr[a] += ',' + value;
                            break;
                        } else
                            arr.push(field + "." + value);
                    }
                } else
                    arr.push(field + "." + value);
            }
        }
        var fieldValueArr = [];
        for (var j = 0; j < arr.length; j++) {
            if (fieldValueArr.indexOf(arr[j]) === -1) {
                fieldValueArr.push(arr[j]);
            }
        }
        return fieldValueArr;
    },

    _getField: function(str) {
        var position = 0;
        for (var i = 0; i < str.length; i++)
            if ((str[i] != '_' && isNaN(str[i])) && str[i] === str[i].toUpperCase()) position = i;

        return position + 1;
    },

    _getValue: function(str) {
        for (var i = 0; i < str.length; i++)
            if (((str[i] != '_' && isNaN(str[i])) && str[i] === str[i].toUpperCase()) || str[i] == "=") return i;

        return 0;
    },

    type: 'AisMigrationTitleTextHandler'
};
