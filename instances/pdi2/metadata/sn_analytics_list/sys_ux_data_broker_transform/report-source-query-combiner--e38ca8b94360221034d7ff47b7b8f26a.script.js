function transform(input) {
    var reportSourceId = input.reportSourceId;
    var filters = input.filters;
    var table = input.table;
    var combinedQuery = new global.ReportSourceUtil().getFullQuery(table, filters, reportSourceId);
    return combinedQuery;
}
