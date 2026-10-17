(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var baseTableName = request.pathParams.table;
        var referenceTables = request.queryParams.referencedTables ?
            String(request.queryParams.referencedTables).split(',') : [];

        var isFetchingDataOnlyForRequestedReferences = !!referenceTables.length;
        if (!isFetchingDataOnlyForRequestedReferences){ 
			referenceTables.push(...getParentTableInHierarchy(baseTableName));
		}

        // Get list of parent tables if any, for each of reference table.
        var parentTableForEachReferenceTableMap = getParentTableForEachReferenceTable(
            referenceTables, isFetchingDataOnlyForRequestedReferences
        );

        // Response will not include that invalid table/s data.
        var areTablesValid = !!parentTableForEachReferenceTableMap;
        if (!areTablesValid) {
            return {};
        }

        // Form encoded query and get reference tables data at once
        var encodedQuery = formEncodedQueryForReferenceAndItsParentTable(parentTableForEachReferenceTableMap);

        var referenceFieldsData = getReferenceFieldsData(encodedQuery);

        // Get table labels for each reference table and its extended table
        var referenceTableLabelAndNamesMap = getTableLabelForAllTables(encodedQuery);

        // Group extended table fields with its child table. EG: Group task fields with incident table
        var transformedReferenceFieldsData = transformReferenceFieldsData(referenceFieldsData, parentTableForEachReferenceTableMap, referenceTableLabelAndNamesMap);

        var result = {};
        result.referenceFieldsData = transformedReferenceFieldsData;
        response.setBody(result);
        response.setStatus(200);
    } catch (err) {
        response.setBody({
            "message": gs.getMessage("Something went wrong while fetching table schema data. Please try again."),
            "details": e.message + e.stack
        });
        response.setStatus(500);
    }
})(request, response);

function getParentTableInHierarchy(baseTableName) {
    var tables = [baseTableName];
    var parentTableName = new GlideTableHierarchy(
        baseTableName
    ).getBase();

    if (parentTableName !== baseTableName) {
        tables = tables.concat(getParentTableInHierarchy(parentTableName));
    }

    return tables;
}

function formEncodedQueryForReferenceTables(referenceTables) {
    var referenceQuery = 'referenceISNOTEMPTY^active=true^';
    for (var index in referenceTables) {
        // check if table is extended table
        var tableName = referenceTables[index];
        referenceQuery += 'name=' + tableName + '^OR';
    }


    var modifiedString = referenceQuery.replace(/(\^OR)$/, "");
    return modifiedString;
}

function getFields(tableObject) {
    if (!tableObject) return [];
    return tableObject.fields;
}

function getParentTableForEachReferenceTable(referenceTables, isFetchingDataOnlyForRequestedReferences) {
    var referenceAndItsParentMap = {};

    if (isFetchingDataOnlyForRequestedReferences) {
        //If we have reference table names, no need to query again from sys_dictionary.
        for (var index in referenceTables) {
            var reference = referenceTables[index];
            var parentTable = new GlideTableHierarchy(reference).getBase();
            referenceAndItsParentMap[reference] = parentTable;
        }
    } else {
        var refGr = new GlideRecordSecure('sys_dictionary');
        refGr.addEncodedQuery(formEncodedQueryForReferenceTables(referenceTables), true);
        refGr.query();
        if (!refGr.hasNext()) return;
        while (refGr.next()) {
            var reference = refGr.getValue('reference');
            var parentTable = new GlideTableHierarchy(reference).getBase();
            referenceAndItsParentMap[reference] = parentTable;
        }
    }
    return referenceAndItsParentMap;
}

function formEncodedQueryForReferenceAndItsParentTable(parentTableForEachReferenceTableMap) {
    //Prepare encoded query for all tables
    var encodedQuery = '';
    for (var table in parentTableForEachReferenceTableMap)
        encodedQuery += 'name=' + table + '^ORname=' + parentTableForEachReferenceTableMap[table] + '^OR';

    var modifiedString = encodedQuery.replace(/(\^OR)$/, "");
    return modifiedString;
}

function getReferenceFieldsData(encodedQuery) {
    var referenceData = {};

    var gr = new GlideRecordSecure('sys_dictionary');
    gr.addEncodedQuery(
        'elementISNOTEMPTY^element!=sys_id^active=true^' + encodedQuery
    , true); //filter inactive and collection fields
    gr.query();
    while (gr.next()) {
        var currentTable = gr.getValue('name');
        var field = {
            name: gr.getValue('element'),
            label: gr.getValue('column_label'),
            type: gr.getValue('internal_type'),
            displayType: gr.getDisplayValue('internal_type'),
            tableName: currentTable,
            referenceName: gr.getValue('reference'),
        };

        if (referenceData[currentTable]) {
            referenceData[currentTable].fields.push(field);
        } else {
            referenceData[currentTable] = {
                fields: [field],
            };
        }
    }

    return referenceData;
}

function getTableLabelForAllTables(encodedQuery) {
    var tableLabelAndNameMap = {};
    var documentGr = new GlideRecord('sys_documentation');
    documentGr.addEncodedQuery(encodedQuery, true);
    documentGr.addNullQuery('element');
    documentGr
        .addQuery('language', gs.getSession().getLanguage())
        .addOrCondition('language', 'en');
    documentGr.query();
    while (documentGr.next()) {
        tableLabelAndNameMap[
            documentGr.getValue('name')
        ] = documentGr.getValue('label');
    }
    return tableLabelAndNameMap;
}

function transformReferenceFieldsData(referenceFieldsData, parentTableForEachReferenceTableMap, referenceTableLabelAndNamesMap) {
    var tranformedData = {};
    for (var table in parentTableForEachReferenceTableMap) {
        var parentTable = parentTableForEachReferenceTableMap[table];

        if (table === parentTable) {
            // current table has no parent
            var fields = getFields(referenceFieldsData[table]);
            tranformedData[table] = {
                fields: fields,
                tableLabel: referenceTableLabelAndNamesMap[table],
                tableValue: table,
                count: fields.length,
                isExtendedTable: false,
            };
        } else {
            var fields = getFields(referenceFieldsData[table]);
            var parentFields = getFields(referenceFieldsData[parentTable]);
            var allFields = [].concat(fields, parentFields);
            tranformedData[table] = {
                fields: allFields,
                tableLabel: referenceTableLabelAndNamesMap[table],
                tableValue: table,
                count: allFields.length,
                isExtendedTable: true,
            };
        }
    }
    return tranformedData;
}
