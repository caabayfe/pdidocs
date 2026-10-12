var DecisionTableUtil = (function() {

    var SYS_DB_OBJECT = 'sys_db_object';
    var SYS_DICTIONARY = 'sys_dictionary';

    var SUCCESS = "Success";
    var FAIL = "Failure";

    return {

        /**
         * Returns comma separated list of all tables in hierarchy
         * @param tableName
         * @returns {String}
         */
        getAllTablesInHierarchy: function(tableName) {
            return new GlideTableHierarchy(tableName).getTables();
        },

        /**
         * Returns table glide record for a given name
         * @param tableName
         * @returns {GlideRecord}
         */
        getTableRecordByName: function(tableName) {
            var tableGR = new GlideRecord(SYS_DB_OBJECT);
            tableGR.addQuery("name", tableName);
            tableGR.query();

            while (tableGR.next()) {
                return tableGR;
            }
        },

        /**
         * Returns glide record for a table field
         * @param tableName
         * @param columnName
         * @returns {GlideRecord}
         */
        getFieldRecordByName: function(tableName, columnName) {
            var gr = new GlideRecord(SYS_DICTIONARY);
            gr.addQuery('name', 'IN', this.getAllTablesInHierarchy(tableName));
            gr.addQuery("element", columnName);
            gr.query();

            while (gr.next()) {
                return gr;
            }
        },

        /**
         * Returns list of all choice type fields for a given table
         * @param tableName
         * @param searchTerm
         * @returns {GlideRecord}
         */
        getChoiceTypeFieldsForTable: function(tableName, searchTerm) {

            // Using GlideRecord instead of GlideRecordSecure to allow fetching choiceFields for users with decision table admin role
            var choiceFieldGR = new GlideRecord(SYS_DICTIONARY);
            choiceFieldGR.addQuery('name', 'IN', this.getAllTablesInHierarchy(tableName));

            var choiceCondition = choiceFieldGR.addQuery('internal_type', 'choice');
            choiceCondition.addOrCondition('choice', 'IN', '3,1');

            if (searchTerm) {
                choiceFieldGR.addQuery('column_label', 'STARTSWITH', searchTerm);
            }

            choiceFieldGR.setLimit(50);
            choiceFieldGR.query();

            return choiceFieldGR;
        },

        /**
         * Returns table details for a given name
         * @param tableName
         * @returns {Object}
         */
        getTableDetailsByName: function(tableName) {
            if (!tableName || !tableName.trim()) {
                return {
                    value: '',
                    displayValue: ''
                };
            }
            var tableGR = this.getTableRecordByName(tableName);
            return {
                value: tableGR.getValue('name'),
                displayValue: tableGR.getValue('label')
            };
        },

        /**
         * Returns field details for a given table column combination 
         * @param tableName
         * @param fieldName
         * @returns {Object}
         */
        getFieldDetailsByName: function(tableName, fieldName) {
            var isTableNameValid = tableName && tableName.trim();
            var isFieldNameValid = fieldName && fieldName.trim();

            if (!isTableNameValid || !isFieldNameValid) {
                return {
                    value: '',
                    displayValue: ''
                };
            }
            var fieldGR = this.getFieldRecordByName(tableName, fieldName);
            return {
                value: fieldGR.getValue('element'),
                displayValue: fieldGR.getValue('column_label'),
            };
        },

        /**
         * Validates if all the required fields are present for a given decision artifact
         * This is used in CUD operations for decision artifacts
         * @param decisionArtifact
         * @param requiredFields
         * @returns {Object}
         */
        validateRequiredFieldsForDecisionArtifact: function(decisionArtifact, requiredFields) {
            var errorFields = [];
            var validationStatus = {
                status: SUCCESS,
                message: ""
            };
            for (var curIndx in requiredFields) {
                var currentField = requiredFields[curIndx];
                var currentFieldValue = decisionArtifact[currentField];
                if (!currentFieldValue || !currentFieldValue.trim()) {
                    errorFields.push(currentField);
                }
            }

            if (errorFields.length > 0) {
                validationStatus.status = FAIL;
                if (errorFields.length === 1) {
                    validationStatus.message = errorFields[0] + " is a required field";
                } else {
                    validationStatus.message = errorFields.join(", ") + " are required fields";
                }
            }
            return validationStatus;
        },

        /**
         * Returns the string value of the property for the given property name
         * @param propName
         * @returns {String}
         */
        getSysPropertyValue: function(propName, defaultValue) {
            if (typeof defaultValue === 'undefined') {
                return gs.getProperty(propName);
            }
            return gs.getProperty(propName, defaultValue);
        }
    };
})();
