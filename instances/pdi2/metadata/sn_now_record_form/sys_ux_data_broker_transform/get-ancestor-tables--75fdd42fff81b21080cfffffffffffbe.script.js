function transform(input) {
    var tables = input.tables;
    var result = {};
    var tablesList = tables.split(',');
    var util = new global.GlideRecordUtil();
    tablesList.forEach((table) => {
        if (!result[table])
            result[table] = util.getTables(table);
    });

    return result;
}
