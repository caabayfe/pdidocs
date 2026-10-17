function transform(input) {
    //  Get time for date selected 
    var results = new VSCGetScanResultsDateTimeUtil().getResultsTimeFromDateSelection(input.date, input.suite);
    return results;
}
