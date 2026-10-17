function transform(input) {
    const results = [];
    const {
        searchConfig,
        table,
        searchTerm,
        displayFields,
        offset,
        encodedQuery,
        limit
    } = input;
    const {
        referenceTables,
        domainId
    } = searchConfig;

    if (!searchConfig || !gs.tableExists(table) || searchTerm.length < 3)
        return [];

    const isValidField = (gr, field) => {
        // Handle dot-walked fields
        if (field.indexOf('.') > 0) {
            const lastReference = field.substring(0, field.lastIndexOf('.'));
            const lastField = field.substring(field.lastIndexOf('.') + 1);
            const referenceTable = gr.getElement(lastReference)?.getReferenceTable?.();

            // Handle invalid field
            if (!referenceTable)
                return false;

            const lastReferenceGr = new GlideRecordSecure(referenceTable);
            return lastReferenceGr.isValidField(lastField);
        }

        return gr.isValidField(field);
    };
    const createIsValidFieldFilter = gr => field => isValidField(gr, field);
    const isReferenceField = (gr, field) => isValidField(gr, field) && gr.getElement(field)?.getED()?.getInternalType() == 'reference';
    const getReferenceFieldDisplayName = (gr, field) => new GlideRecordSecure(gr.getElement(field)?.getReferenceTable())?.getDisplayName();

    const getReferenceDisplayNameMap = (gr, fields) => {
        if (!gr || !fields)
            return;

        return fields.reduce((displayNameMap, field) => {
            if (isReferenceField(gr, field) && !displayNameMap.has(field)) {
                const displayName = getReferenceFieldDisplayName(gr, field);
                if (displayName)
                    displayNameMap.set(field, displayName);
            }

            return displayNameMap;
        }, new Map());
    };

    const addDomainQuery = (gr, domainId) => {
        if (!isValidDomainId(domainId)) {
            gs.warn('Invalid domain ID. Using session domain instead.');
            return;
        }

        const domains = getDescendantDomains(domainId);
        gr.addQuery('sys_domain', 'IN', domains.toString());
    };
    
    const getDescendantDomains = (domainId) => {
        let domains = [];
        domains.push(domainId);
        const gr = new GlideRecordSecure('domain');
        gr.addActiveQuery();
        gr.addQuery('parent', domainId);
        gr.query();
        while (gr.next()) {
            domains = domains.concat(getDescendantDomains(gr.getUniqueValue()));
        }
        return domains;
    };

    const isValidDomainId = (domainId) => {
        const gr = new GlideRecordSecure('domain');
        gr.addQuery('sys_id', domainId);
        gr.query();
        if (!gr.hasNext()) {
            return false;
        }
        return true;
    };

    const referenceSysIds = [];
    if (referenceTables) {
        for (const referenceTable in referenceTables) {
            const referenceTableConfig = referenceTables[referenceTable];
            const {
                referenceFields
            } = referenceTableConfig;

            // Ensure valid table and fields are passed in
            if (!gs.tableExists(referenceTable) || !referenceFields)
                continue;

            const gr = new GlideRecordSecure(referenceTable);
            gr.initialize();

            const referenceFieldList = referenceFields.split(',');
            const validReferenceFields = referenceFieldList.filter(function(field) {
                const glideElement = gr.getElement(field);

                // Ensure the field is a valid reference field type and is a reference
                // to the lookup table
                return isValidField(gr, field) &&
                    glideElement.getED().getInternalType() === 'reference' &&
                    glideElement.getReferenceTable() === table;
            });

            if (!validReferenceFields.length)
                continue;

            const exactMatchSearchFieldList = referenceTableConfig
                .exactMatchSearchFields
                ?.split(",")
                ?.filter(createIsValidFieldFilter(gr));

            const startsWithSearchFieldList = referenceTableConfig
                .startsWithSearchFields
                ?.split(",")
                ?.filter(createIsValidFieldFilter(gr));

            // Ensure valid search fields
            if (
                !exactMatchSearchFieldList?.length &&
                !startsWithSearchFieldList?.length
            ) continue;

            const exactMatchReferenceDisplayNameMap = getReferenceDisplayNameMap(gr, exactMatchSearchFieldList);
            const startsWithReferenceDisplayNameMap = getReferenceDisplayNameMap(gr, startsWithSearchFieldList);

            let grOr;

            // Exact match field queries
            if (exactMatchSearchFieldList?.length) {
                grOr = gr.addQuery(exactMatchSearchFieldList[0], searchTerm);
                exactMatchSearchFieldList.forEach((field, index) => {
                    if (exactMatchReferenceDisplayNameMap?.has(field))
                        grOr.addOrCondition(`${field}.${exactMatchReferenceDisplayNameMap.get(field)}`, searchTerm);

                    index !== 0 && grOr.addOrCondition(field, searchTerm);
                });
            }

            // Starts with field queries
            if (startsWithSearchFieldList?.length) {
                if (!grOr)
                    grOr = gr.addQuery(startsWithSearchFieldList[0], "STARTSWITH", searchTerm);
                else
                    grOr.addOrCondition(startsWithSearchFieldList[0], "STARTSWITH", searchTerm);
                startsWithSearchFieldList.forEach((field, index) => {
                    if (startsWithReferenceDisplayNameMap?.has(field))
                        grOr.addOrCondition(`${field}.${startsWithReferenceDisplayNameMap.get(field)}`, "STARTSWITH", searchTerm);

                    index !== 0 && grOr.addOrCondition(field, "STARTSWITH", searchTerm);
                });
            }
            gr.query();

            while (gr.next()) {
                validReferenceFields.forEach(function(field) {
                    const value = gr.getValue(field);
                    if (value)
                        referenceSysIds.push(value);
                });
            }
        }
    }

    const gr = new GlideRecordSecure(table);
    gr.initialize();

    const exactMatchFieldList = searchConfig
        .exactMatchSearchFields
        ?.split(",")
        ?.filter(createIsValidFieldFilter(gr));

    const startsWithSearchFieldList = searchConfig
        .startsWithSearchFields
        ?.split(",")
        .filter(createIsValidFieldFilter(gr));

    if (!referenceSysIds?.length &&
        !exactMatchFieldList?.length &&
        !startsWithSearchFieldList?.length)
        return [];

    const exactMatchReferenceDisplayNameMap = getReferenceDisplayNameMap(gr, exactMatchFieldList);
    const startsWithReferenceDisplayNameMap = getReferenceDisplayNameMap(gr, startsWithSearchFieldList);

    let grOr;

    // Exact match field queries
    if (exactMatchFieldList?.length) {
        grOr = gr.addQuery(exactMatchFieldList[0], searchTerm);
        exactMatchFieldList.forEach((field, index) => {
            if (exactMatchReferenceDisplayNameMap?.has(field))
                grOr.addOrCondition(`${field}.${exactMatchReferenceDisplayNameMap.get(field)}`, searchTerm);

            index !== 0 && grOr.addOrCondition(field, searchTerm);
        });
    }

    // Starts with field queries
    if (startsWithSearchFieldList?.length) {
        if (!grOr)
            grOr = gr.addQuery(startsWithSearchFieldList[0], "STARTSWITH", searchTerm);
        else
            grOr.addOrCondition(startsWithSearchFieldList[0], "STARTSWITH", searchTerm);
        startsWithSearchFieldList.forEach((field, index) => {
            if (startsWithReferenceDisplayNameMap?.has(field))
                grOr.addOrCondition(`${field}.${startsWithReferenceDisplayNameMap.get(field)}`, "STARTSWITH", searchTerm);

            index !== 0 && grOr.addOrCondition(field, "STARTSWITH", searchTerm);
        });
    }

    // Reference sys_ids
    if (referenceSysIds.length) {
        if (!grOr)
            gr.addQuery('sys_id', 'IN', referenceSysIds.join(','));
        else
            grOr.addOrCondition('sys_id', 'IN', referenceSysIds.join(','));
    }

    if (encodedQuery)
        gr.addQuery(encodedQuery);

    // Add domain query when domain separation plugin is activated and valid domainId is passing
    if (!gs.nil(domainId) && GlidePluginManager.isActive('com.glide.domain'))
        addDomainQuery(gr, domainId);

    gr.setLimit(limit);
    gr.chooseWindow(offset, limit);

    gr.query();

    // Deduplicated display field list 
    const displayFieldsList = Array.from(new Set([
        // Include the table display field in the results
        gr.getDisplayName(),
        ...displayFields.split(',')
    ]));

    // Construct results based on display fields
    while (gr.next()) {
        const result = {};

        if (displayFieldsList.length) {
            displayFieldsList.forEach(function(field, index) {
                const fieldName = field;

                const fieldResult = {};

                fieldResult.value = gr.getValue(fieldName);
                fieldResult.displayValue = gr.getDisplayValue(fieldName);

                const glideElement = gr.getElement(fieldName);

                fieldResult.label = glideElement.getLabel();
                fieldResult.internalType = glideElement.getED().getInternalType();

                if (fieldResult.internalType === 'reference') {
                    fieldResult.referenceTable = glideElement.getReferenceTable();
                    fieldResult.referenceValue = gr.getValue(field);
                    fieldResult.referenceDisplayValue = gr.getDisplayValue(field);
                }

                result[fieldName] = fieldResult;
            });
        }

        const rowData = {};
        rowData.displayValue = gr.getDisplayValue();
        rowData.uniqueValue = gr.getUniqueValue();

        result._row_data = rowData;
        result._isAdvancedSearch = true;

        results.push(result);
    }

    return results;
}
