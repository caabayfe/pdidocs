function transform(input) {
    var tableName = input.tableName;
    var totalRecordCount = input.totalRecordCount;
    var choice = input.choice;

    var purgeAuditRecordEstimator = new PurgeAuditRecordEstimator();

    totalRecordCount = totalRecordCount != -1 ?
        totalRecordCount :
        purgeAuditRecordEstimator.getAuditRecordsByTable(tableName);

    return purgeAuditRecordEstimator.getRecordEstimationDetails(tableName, choice, totalRecordCount);
}
