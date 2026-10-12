(function() {
    if (!options || !options.recordId || !options.parentTable || !options.table || !options.fields)
        return;
    var parentTable = options.parentTable;
    var table = options.table;
    var fields = options.fields.split(",");
    var recordId = options.recordId;
    var util = new sn_ex_sp.ApprovalHubUtil();
    var referenceField = util.getReferenceField(table, parentTable);
    data.childData = [];
    var tableRecords = new GlideRecord(table);
    tableRecords.query(referenceField, recordId);
    tableRecords.orderBy('created');
    tableRecords.query();
    while (tableRecords.next()) {
        if (tableRecords.canRead()) {
            var childRecord = util.getFieldsInformation(tableRecords, fields);
            data.childData.push(childRecord);
        }
    }

})();
