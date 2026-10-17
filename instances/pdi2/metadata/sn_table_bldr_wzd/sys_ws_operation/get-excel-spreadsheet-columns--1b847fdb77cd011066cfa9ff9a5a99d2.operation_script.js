(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var apiResponse = new ExcelSpreadsheetColumns(request.queryParams).build();
    return apiResponse;

})(request, response);
