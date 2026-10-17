(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const {
        product,
        packageIds,
        selectedTableName,
        recordQuery,
        filters: {
            lastUpdatedOn,
            lastUpdatedBy
        },
    } = request.body.data;

    let result = getPackageInfo(packageIds, recordQuery, lastUpdatedOn, lastUpdatedBy, selectedTableName);
    response.setContentType('application/json');
    response.setStatus(200);
    response.setBody(result);

    function getPackageInfo(packageIds, recordQuery, lastUpdatedOn, lastUpdatedBy, selectedTableName) {
        const lastUpdatedOnFilterToQueryValueMapping = {
            '24h': 'javascript:gs.daysAgo(1)',
            '3d': 'javascript:gs.daysAgo(3)',
            '1w': 'javascript:gs.daysAgo(7)',
            '2w': 'javascript:gs.daysAgo(14)',
            '1m': 'javascript:gs.monthsAgo(1)',
            '3m': 'javascript:gs.monthsAgo(3)',
        };
        let numberOfTablesWithRecords = 0;
        let selectedTableFound = false;
        let tables = [];
        const pinned = gs.getUser().getPreference('configuration_hub.default_console.pinned_tables');
        let visitedPinnedTablesSet = new Set();
        if (packageIds && packageIds.length === 0)
            return tables;

        const metadataGr = new GlideAggregate('sys_metadata');
        metadataGr.addQuery('sys_package', 'IN', packageIds.join());
        if (recordQuery) {
            var query = metadataGr.addQuery('sys_name', 'CONTAINS', recordQuery);
            if (recordQuery.length === 32)
                query.addOrCondition('sys_id', recordQuery);
        }

        if (lastUpdatedOn && lastUpdatedOnFilterToQueryValueMapping[lastUpdatedOn])
            metadataGr.addQuery('sys_updated_on', '>=', lastUpdatedOnFilterToQueryValueMapping[lastUpdatedOn]);

        if (lastUpdatedBy && lastUpdatedBy.length > 0)
            metadataGr.addQuery('sys_updated_by', 'IN', lastUpdatedBy.join());

        metadataGr.addAggregate('COUNT', 'sys_class_name');
        metadataGr.addAggregate('MAX', 'sys_updated_on');
        metadataGr.query();
        while (metadataGr.next()) {
            const tableName = metadataGr.getValue('sys_class_name');
            const tableGr = getTableGlideRecord(tableName);
            const tableLastUpdatedOn = metadataGr.getAggregate('MAX', 'sys_updated_on');
            if (!tableGr)
                continue;

            let isPinned = pinned.split(',').indexOf(tableName) >= 0;
            if (isPinned)
                visitedPinnedTablesSet.add(tableName);
            let recordCount = parseInt(metadataGr.getAggregate('COUNT', 'sys_class_name'));
            tables.push({
                id: tableName,
                label: getPluralLabel(tableName, tableGr.getDisplayValue()),
                isPinned: isPinned,
                recordCount,
                lastUpdatedOn: tableLastUpdatedOn
            });

            if (selectedTableName && !selectedTableFound && tableName === selectedTableName)
                selectedTableFound = true;

            if (recordCount > 0)
                numberOfTablesWithRecords++;
        }

        // Adding back currently viewing table if it was filtered out
        if (selectedTableName && !selectedTableFound) {
            const selectedTableGr = getTableGlideRecord(selectedTableName);
            let isPinned = pinned.split(',').indexOf(selectedTableName) >= 0;
            if (isPinned)
                visitedPinnedTablesSet.add(selectedTableName);
            if (selectedTableGr !== null)
                tables.push({
                    id: selectedTableName,
                    label: getPluralLabel(selectedTableName, selectedTableGr.getDisplayValue()),
                    isPinned: isPinned,
                    recordCount: 0
                });
        }

        // adding all pinned tables which didn't appear in results
        const pinnedTables = pinned.split(',');
        for (let pinnedTable of pinnedTables) {
            const tableGr = !visitedPinnedTablesSet.has(pinnedTable) ? getTableGlideRecord(pinnedTable) : null;
            if (tableGr !== null)
                tables.push({
                    id: pinnedTable,
                    label: getPluralLabel(pinnedTable, tableGr.getDisplayValue()),
                    isPinned: true,
                    recordCount: 0
                });
        }

        // get encoded query, remove '^ORDERBYsys_class_name^GROUPBYsys_class_name' from end of query string
        let encodedQuery = metadataGr.getEncodedQuery();
        encodedQuery = encodedQuery.substring(0, encodedQuery.length - 44);

        return {
            tables: tables.sort(sortTables('label')),
            pinnedTables: pinned,
            query: encodedQuery,
            numberOfTablesWithRecords
        };
    }

    function getTableGlideRecord(tableClassName) {
        const tableGr = new GlideRecord('sys_db_object');
        if (!tableGr.get('name', tableClassName)) {
            gs.error('[CONFIGURATION_HUB] Failed to find table: ' + tableClassName);

            return null;
        }

        return tableGr;
    }

    function getPluralLabel(tableClassName, fallback) {
        const docGr = new GlideRecord('sys_documentation');
        docGr.addNullQuery('element');
        docGr.addQuery('name', tableClassName);
        docGr.query();
        if (docGr.next())
            return docGr.plural.getDisplayValue();

        gs.warn('[CONFIGURATION_HUB] No plural label found for table ${tableClassName}');

        return fallback;
    }

    function sortTables(field) {
        return function(a, b) {
            const countA = a['recordCount'];
            const countB = b['recordCount'];
            if (countA !== countB && countA * countB === 0) {
                return countA === 0 ? 1 : -1;
            }

            if (a[field] > b[field])
                return 1;
            else if (a[field] < b[field])
                return -1;
            return 0;
        };
    }

})(request, response);
