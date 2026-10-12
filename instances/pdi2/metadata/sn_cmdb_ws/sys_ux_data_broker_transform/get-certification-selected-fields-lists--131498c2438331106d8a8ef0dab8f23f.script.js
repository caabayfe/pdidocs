function transform(input) {
    var wrapperFunction = function() {
		var DICTIONARY = {
			TABLE : "sys_dictionary",
			TABLE_FIELD : "name", 
			COLUMN_NAME : "element",
			COLUMN_LABEL : "column_label"
		};



        var table = input.table;
        var policyId = input.policyId;

        var result = {};
        var gr = new GlideRecord("sn_cmdb_ws_dm_certification_policy");
        gr.get(policyId);

        var displayFields = gr.getValue("display_fields");
        var certificationFields = gr.getValue("certification_fields");

        var displayFieldsList = displayFields ? displayFields.split(",") : [];
        var certificationFieldsList = certificationFields ? certificationFields.split(",") : [];

        var displayFieldsObject = {};
        var certificationFieldsObject = {};

        for (var i = 0; i < displayFieldsList.length; i++) {
            displayFieldsObject[displayFieldsList[i]] = true;
        }

        for (var i = 0; i < certificationFieldsList.length; i++) {
            certificationFieldsObject[certificationFieldsList[i]] = true;
        }

        var displayFieldOptions = [];
        var certificationFieldOptions = [];
        var displayFieldSelections = [];
        var certificationFieldSelections = [];

        var tableGr = new GlideRecord(DICTIONARY.TABLE);
        tableGr.addQuery(DICTIONARY.TABLE_FIELD, table);
		tableGr.orderBy(DICTIONARY.COLUMN_NAME);
        tableGr.query();

        while (tableGr.next()) {
            var id = tableGr.getValue(DICTIONARY.COLUMN_NAME);
            var label = tableGr.getValue(DICTIONARY.COLUMN_LABEL);

            if (global.JSUtil.nil(id) || global.JSUtil.nil(label))
                continue;

            var displayField = {
                "id": id,
                "label": label
            };
            var certField = {
                "id": id,
                "label": label
            };

            if (!displayFieldsObject[id]) {
                certField.disabled = false;
                certificationFieldOptions.push(certField);
            } else {
                certField.disabled = true;
                certificationFieldOptions.push(certField);
            }

            if (!certificationFieldsObject[id]) {
                displayField.disabled = false;
                displayFieldOptions.push(displayField);
            } else {
                displayField.disabled = true;
                displayFieldOptions.push(displayField);
            }
        }


        for (var i = 0; i < displayFieldsList.length; i++) {
            var displayFieldGr = new GlideRecord(DICTIONARY.TABLE);
            displayFieldGr.addQuery(DICTIONARY.TABLE_FIELD, table);
            if (displayFieldsList[i].includes(".")) {
                var temp = {};
                temp.id = displayFieldsList[i];
                temp.label = displayFieldsList[i].toUpperCase();
                displayFieldSelections.push(temp);
                displayFieldOptions.push(temp);
            } else {
                displayFieldGr.addQuery(DICTIONARY.COLUMN_NAME, displayFieldsList[i]);
                displayFieldGr.query();

                if (displayFieldGr.next()) {
                    var temp = {};
                    var id = displayFieldGr.getValue(DICTIONARY.COLUMN_NAME);
                    var label = displayFieldGr.getValue(DICTIONARY.COLUMN_LABEL);
                    temp.id = id;
                    temp.label = label;
                    displayFieldSelections.push(temp);
                }
            }
        }

        for (var i = 0; i < certificationFieldsList.length; i++) {
            var certificationFieldGr = new GlideRecord(DICTIONARY.TABLE);
            certificationFieldGr.addQuery(DICTIONARY.TABLE_FIELD, table);
            if (certificationFieldsList[i].includes(".")) {
                var temp = {};
                temp.id = certificationFieldsList[i];
                temp.label = certificationFieldsList[i].toUpperCase();
                certificationFieldSelections.push(temp);
                certificationFieldOptions.push(temp);
            } else {
                certificationFieldGr.addQuery(DICTIONARY.COLUMN_NAME, certificationFieldsList[i]);
                certificationFieldGr.query();

                if (certificationFieldGr.next()) {
                    var temp = {};
                    var id = certificationFieldGr.getValue(DICTIONARY.COLUMN_NAME);
                    var label = certificationFieldGr.getValue(DICTIONARY.COLUMN_LABEL);
                    temp.id = id;
                    temp.label = label;
                    certificationFieldSelections.push(temp);
                }
            }
        }

        result.displayFieldOptions = displayFieldOptions;
        result.certificationFieldOptions = certificationFieldOptions;
        result.displayFieldSelections = displayFieldSelections;
        result.certificationFieldSelections = certificationFieldSelections;

        return result;
    };
    return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Get certification selected fields lists", wrapperFunction);
}
