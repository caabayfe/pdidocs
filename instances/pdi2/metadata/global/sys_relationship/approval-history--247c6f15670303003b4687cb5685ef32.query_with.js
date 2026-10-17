(function refineQuery(current, parent) {
    var table = new TableUtils(parent.getTableName());
    var hierarchyTableList = table.getTables();
    // Use the j2js method to convert the Java ArrayList to JavaScript
    gs.include("j2js");
    var hierarchyTables = j2js(hierarchyTableList);
    current.addQuery('source_table', 'IN', hierarchyTables);
    current.addQuery('document_id', parent.sys_id);
})(current, parent);
