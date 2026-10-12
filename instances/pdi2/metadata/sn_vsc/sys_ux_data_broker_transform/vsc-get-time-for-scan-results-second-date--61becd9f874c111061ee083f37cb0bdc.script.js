function transform(input) {
    var results = new VSCGetScanResultsDateTimeUtil().getResultsTimeFromDateSelection(input.date, input.suite);
    return results;
}
