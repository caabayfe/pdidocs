(function executeRule(current, previous /*null when async*/ ) {
    if (current.isActionAborted())
        return;

    var dataFilterTableName = current.table_name;
    var tableHierarchy = GlideDBObjectManager.getTables(dataFilterTableName);

    // if this table is the only one in its hierarchy, no need to look for other data filters on parent tables
    // just check for a matching read ACL
    if (tableHierarchy.size() == 1) {
        // if there's a read ACL, nothing to do
        if (hierarchyHasActiveReadAcl([dataFilterTableName]))
            return;

        gs.addInfoMessage(gs.getMessage('There is no table-level read ACL for this table, which may allow data to leak when data filters are disabled. ServiceNow does not recommend relying on * read ACLs to secure tables.'));
        return;
    }

    if (!hierarchyHasActiveReadAcl(tableHierarchy)) {
        gs.addInfoMessage(gs.getMessage('This table is missing a table-level read ACL in its table hierarchy to protect it when data filters are disabled. ServiceNow does not recommend relying on * read ACLs to secure tables.'));
    }

    var ancestorTables = getAncestorsWithoutTable(tableHierarchy, dataFilterTableName);
    if (!tableAncestorsHaveActiveDataFilter(ancestorTables)) {
        gs.addInfoMessage(gs.getMessage('This table is missing a data filter on one of its parent tables. Add a data filter to the parent table to prevent unauthorized access to this table\'s data.'));
    }

    function tableAncestorsHaveActiveDataFilter(tableNames) {
        var dataFilterGr = new GlideRecord('sys_security_data_filter');
        dataFilterGr.addQuery('table_name', tableNames);
        dataFilterGr.addQuery('active', 'true');
        dataFilterGr.query();
        return dataFilterGr.hasNext();
    }

    function hierarchyHasActiveReadAcl(tableNames) {
        var aclGr = new GlideRecord('sys_security_acl');
        aclGr.addQuery('name', tableNames);
        aclGr.addQuery('operation', 'read');
        aclGr.addQuery('active', 'true');
        aclGr.query();
        return aclGr.hasNext();
    }

    function getAncestorsWithoutTable(ancestorList, tableToRemove) {
        return ancestorList.toArray().filter(function(table) {
            return table != tableToRemove;
        });
    }
})(current, previous);
