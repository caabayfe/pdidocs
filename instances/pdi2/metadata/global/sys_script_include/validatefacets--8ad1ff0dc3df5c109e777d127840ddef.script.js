var facet_inclusion_list = ["tags", "language"];
var inclusionPrefix = "topic";
var dateScalarTypes = ['date', 'time', 'datetime'];
var multiSelectAndTypes = ['tags', 'glide_list'];
var util = new AisConfigurationUtil();
var objectManager = GlideObjectManager.getManager();
var ValidateFacets = Class.create();
var arrayUtil = new ArrayUtil();
ValidateFacets.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    type: 'ValidateFacets',
    validate_existing_records: function() {
        if (!gs.hasRole('search_application_admin'))
            return 'The search_application_admin role is required to execute this script';

        var searchProfile = this.getParameter('sysparm_search_profile');
        var searchAppConfig = this.getParameter('sysparm_search_config');
        var invalidFacets = [];

        //Fetch Facets Records
        var facetGr = new GlideRecord('sys_search_facet');
        facetGr.addQuery('search_context_config', searchAppConfig);
        facetGr.query();

        //Check if the Facet is in Search Sources
        while (facetGr.next()) {
            if (arrayUtil.contains(facet_inclusion_list, String(facetGr.ais_facet_name))) continue;
            var tableName = (facetGr.ais_facet_name).split('.')[0];
            var searchSourceGr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
            searchSourceGr.addQuery('profile.sys_id', searchProfile);
            searchSourceGr.addQuery('search_source.datasource.source', tableName);
            searchSourceGr.query();

            var isFacetValid = searchSourceGr.hasNext();

            if (!isFacetValid) invalidFacets.push(facetGr.getValue('name'));

        }
        //return list of invalid facets
        return JSON.stringify(invalidFacets);

    },
    validate_facet_field: function() {
        if (!gs.hasRole('search_application_admin'))
            return 'The search_application_admin role is required to execute this script';

        var profile_id = this.getParameter('sysparm_search_profile');
        var facetFields = String(this.getParameter('sysparm_facet_field')).toLowerCase().split(',');
        var exclusionList = gs.getProperty('glide.search.facet.exclusion_list', 'kb_knowledge.sys_view_count').toLowerCase().split(',');
        var facet_id = this.getParameter('sysparm_facet_id');
        var scalarType;
        var prevScalarType = null;
        //Trim elements of exclusionList
        for (var j = 0; j < exclusionList.length; j++) {
            exclusionList[j] = exclusionList[j].trim();
        }

        //Get Search Profile From Facet_Id
        if (!profile_id) {
            var facet_gr = new GlideRecord('sys_search_facet');
            facet_gr.get(facet_id);
            profile_id = facet_gr.search_context_config.search_profile;
        }

        for (var i = 0; i < facetFields.length; i++) {
            var facetField = facetFields[i].trim();

            //Bypass validations if exception
            if (arrayUtil.contains(facet_inclusion_list, facetField))
                return "valid";

            //Check if string format is correct
            if (!RegExp(/^\w+(\.\w+)+$/).test(facetField)) {
                gs.addErrorMessage(gs.getMessage("Invalid Format. Please ensure the Facet Field is in the format: '[table name].[field name]' such as 'sys_user.name'"));
                return "string_error";
            }
            var idx = facetField.indexOf('.');
            var tableName = facetField.substring(0, idx);
            var fieldName = facetField.substring(idx + 1);

            //Validate Table Name
            var gr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
            gr.addQuery('profile.sys_id', profile_id);
            gr.addQuery('search_source.datasource.source', tableName);
            gr.query();
            if (!gr.hasNext()) {
                gs.addErrorMessage(gs.getMessage("Invalid Table Name: [{0}]. Please ensure that the table is defined in the current search profile's search sources.", [tableName]));
                return "table_error:" + tableName;
            }

            //Bypass field validations if exception
            if (fieldName.startsWith(inclusionPrefix))
                return "valid";

            //Validate Field Name
            var types = this._getFieldType(facetField);
            if (types == null) {
                gs.addErrorMessage(gs.getMessage("Invalid Field Name: [{0}]. Please ensure that the field is defined in the supplied table or child tables: [{1}]", [fieldName, tableName]));
                return "field_error:" + tableName + ":" + fieldName;
            }
            scalarType = types[1];
            if (facetFields.length > 1) {
                if (prevScalarType != null && prevScalarType != scalarType)
                    return "inconsistent_field_types";
                prevScalarType = scalarType;
            }

            // Validate not in exclusion list
            if (arrayUtil.contains(exclusionList, String(facetField))) {
                gs.addErrorMessage(gs.getMessage("Invalid Field Name: [{0}]. This field is in listed in the glide.search.facet.exclusion_list property.", [fieldName]));
                return "field_error:" + tableName + ":" + fieldName;
            }

            // Validate Dot walk is enabled in attribute list
            var attribute_gr = new GlideRecord('ais_datasource_field_attribute');
            idx = fieldName.indexOf('.');
            if (idx > 0) {
                var dotWalkField = fieldName.substring(0, idx);
                var dotWalkValue = fieldName.substring(idx + 1);
                attribute_gr.addQuery('source', tableName);
                attribute_gr.addQuery('field', dotWalkField);
                attribute_gr.addQuery('attribute.attribute', 'dot_walk_fields');
                attribute_gr.query();
                if (!attribute_gr.next()) {
                    gs.addErrorMessage(gs.getMessage("Invalid Dot Walk Table Name: [{0}]. Please ensure that the Dot walk table is configured for indexing in the indexed source.", [dotWalkField]));
                    return "field_error:" + tableName + ":" + fieldName;
                }
                var possibleValues = attribute_gr.getValue('value').replace(/ /g, '').split(',');
                if (!arrayUtil.contains(possibleValues, dotWalkValue)) {
                    gs.addErrorMessage(gs.getMessage("Invalid Dot Walk Field Name: [{0}]. Please ensure that the Dot walk field is configured for indexing in the indexed source.", [dotWalkValue]));
                    return "field_error:" + tableName + ":" + fieldName;
                }
            }

            // Validate is not no_text_index
            attribute_gr = new GlideRecord('ais_datasource_field_attribute');
            attribute_gr.addQuery('source', tableName);
            attribute_gr.addQuery('field', fieldName);
            attribute_gr.addQuery('attribute.attribute', 'no_text_index');
            attribute_gr.addQuery('value', 'true');
            attribute_gr.query();
            if (attribute_gr.hasNext()) {
                gs.addErrorMessage(gs.getMessage("Invalid Field Name: [{0}]. Please ensure that this field not ignored by the indexed source configuration.", [fieldName]));
                return "field_error:" + tableName + ":" + fieldName;
            }
        }
        return "valid";
    },
    validate_facet_type: function() {
        var facetFields = this.getParameter('sysparm_facet_field');
        var facetType = this.getParameter('sysparm_type');
        return this.validate_facet_type_with_param(facetFields, facetType);
    },
    validate_facet_type_with_param: function(facetFields, facetType) {
        if (!gs.hasRole('search_application_admin'))
            return 'The search_application_admin role is required to execute this script';
        facetFields = String(facetFields).toLowerCase().split(',');
        facetType = String(facetType).toLocaleLowerCase();
        for (var i in facetFields) {
            var field = facetFields[i].trim();
            var fieldTypes = this._getFieldType(field);
            if (fieldTypes == null)
                return 'error_field';
            var type = fieldTypes[0];
            var scalarType = fieldTypes[1];
            switch (facetType) {
                case 'single_select':
                    // date field can only be single select
                    break;
                case 'multi_select_or':
                    if (arrayUtil.contains(dateScalarTypes, String(scalarType)))
                        return 'error_date_type';
                    break;
                case 'multi_select_and':
                default:
                    // null value defaults to multi-select-and
                    // multi-select-and only recommends to multi-value fields: glide_list/tags
                    if (arrayUtil.contains(dateScalarTypes, String(scalarType)))
                        return 'error_date_type';
                    if (!arrayUtil.contains(multiSelectAndTypes, String(type)))
                        return 'warning_multi_select_and';
            }
        }
        return 'valid';
    },
    _getFieldType: function(facetField) {
        var idx = facetField.indexOf('.');
        if (idx < 0)
            return facetField;

        var facetFieldSplit = facetField.split('.');
        var tableName = facetFieldSplit[0];
        var column = facetFieldSplit[1];
        var allColumn = facetField.substring(idx + 1);
        var scalarType = null;
        var type, el;
        var gr = new GlideRecord(tableName);
        if (!gr.isValidField(column)) {
            var validChildTableField = util.validFieldInChildTable(tableName, column);
            if (validChildTableField.matched) {
                gr = new GlideRecord(validChildTableField.childTableName);
            }
        }
        el = gr.getElement(allColumn);
        if (el == null)
            return null;
        type = el.getED().getInternalType();
        scalarType = objectManager.getObjectScalarType(type);
        return [type, scalarType];
    }
});
