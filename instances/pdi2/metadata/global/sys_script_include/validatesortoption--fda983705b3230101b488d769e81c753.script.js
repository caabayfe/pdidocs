var commonFields = ["title", "sort_by_date"];
var disallowedFields = ["text", "tags", "description"];
var allowedTypes = ["glide_date", "decimal", "price", "string", "integer", "glide_date_time"];

var ValidateSortOption = Class.create();
ValidateSortOption.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'ValidateSortOption',

    validateSortField: function() {
        if (!gs.hasRole('search_application_admin'))
            return 'The search_application_admin role is required to execute this script';

        var searchProfile = this.getParameter('sysparm_search_profile');
        var sortField = String(this.getParameter('sysparm_sort_field'));

        // if this is a common field, no futher validation is needed
        if (commonFields.indexOf(sortField) != -1)
            return "valid";
        if (disallowedFields.indexOf(sortField) != -1)
            return "disallowed_field";

        // confirm correct string format
        if (!RegExp(/\w+\.\w+/).test(sortField))
            return "string_error";

        // split the field into it's components
        var tableName = sortField.split('.')[0];
        var fieldName = sortField.split('.')[1];
        if (disallowedFields.indexOf(fieldName) != -1)
            return "disallowed_field";

        // confirm table is part of search application
        if (!this._validTableName(tableName, searchProfile))
            return "table_error";

        // confirm field is part of table definition
        if (!this._fieldInTable(fieldName, tableName)) {
            // if field not part of table definition, check if field is in child tables
            var util = new AisConfigurationUtil();
            var validChildTableField = util.validFieldInChildTable(tableName, fieldName);
            if (validChildTableField.matched) {
                tableName = validChildTableField.childTableName;
            } else {
                return "field_error";
            }
        }

        // confirm field is not excluded from the index
        if (!this._fieldInIndex(fieldName, tableName, searchProfile))
            return "no_index";

        // confirm field type is number, date, or string
        if (!this._validFieldType(fieldName, tableName))
            return "type_error";

        return "valid";
    },

    _validTableName: function(tableName, searchProfile) {
        var gr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
        gr.addQuery('profile.sys_id', searchProfile);
        gr.addQuery('search_source.datasource.source', tableName);
        gr.query();
        return gr.hasNext();
    },

    _fieldInTable: function(fieldName, tableName) {
        var gr = new GlideRecord(tableName);
        return gr.isValidField(fieldName);
    },

    _fieldInIndex: function(fieldName, tableName) {
        var gr = new GlideRecord("ais_datasource_field_attribute");
        var condition = gr.addJoinQuery("ais_datasource", "datasource");
        gr.addQuery("datasource.source", tableName);
        gr.addQuery("field", fieldName);
        gr.query();
        while (gr.next()) {
            // if the field's attribute is "no_text_index", then this field can't be sorted
            if (gr.getValue("attribute") === "b744a634c7320010d1cfd9795cc26011") return false;
        }
        // if the field is mapped to something else in the AIS schema,
        // we may need to do something fancy for this sorting option...
        return true;
    },

    _validFieldType: function(fieldName, tableName) {
        var gr = new GlideRecord("sys_dictionary");
        gr.addQuery("name", tableName);
        gr.addQuery("element", fieldName);
        gr.query();
        if (gr.next()) {
            var type = gr.getValue("internal_type");
            return allowedTypes.indexOf(type) != -1;
        } else { // This means it's a child table, and field is inherited from a parent (it won't have an entry in sys_dictionary)
            // Get parent tables
            var tableUtil = new TableUtils(tableName);
            var tableArrayList = tableUtil.getTables();
            gs.include("j2js");
            var parents = j2js(tableArrayList);
            for (var i = 0; i < parents.length; i++) { //Check each parent table to find the field
                var parentTable = parents[i];
                var glideRecord = new GlideRecord("sys_dictionary");
                glideRecord.addQuery("name", parentTable);
                glideRecord.addQuery("element", fieldName);
                glideRecord.query();
                if (glideRecord.next()) {
                    var parentType = glideRecord.getValue("internal_type");
                    return allowedTypes.indexOf(parentType) != -1;
                }
            }
        }
        return false;
    }
});
