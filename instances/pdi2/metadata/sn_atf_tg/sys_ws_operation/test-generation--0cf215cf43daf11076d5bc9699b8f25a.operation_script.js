(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
    var requestJSON = request.body.data;
    var tableEncodedQuery = requestJSON['tableEncodedQuery'] ? requestJSON['tableEncodedQuery'] : "";
    var userEncodedQuery = requestJSON['userEncodedQuery'] ? requestJSON['userEncodedQuery'] : "";
    var catalogEncodedQuery = requestJSON['catalogEncodedQuery'] ? requestJSON['catalogEncodedQuery'] : "";
    var email = requestJSON["email"] ? requestJSON["email"] : "";
    var maxTestCountPerTable = requestJSON["maxTestCountPerTable"] ? requestJSON["maxTestCountPerTable"] : "5";
    var maxTestCount = requestJSON["maxTestCount"] ? requestJSON["maxTestCount"] : "2000";
    var maxTestCountPerItem = requestJSON["maxTestCountPerItem"] ? requestJSON["maxTestCountPerItem"] : "2";
    var separateUpdateSetPerScope = requestJSON["separateUpdateSetPerScope"] ? requestJSON["separateUpdateSetPerScope"] : false;
    var scopeForGeneratingTests = requestJSON["scopeForGeneratingTests"] ? requestJSON["scopeForGeneratingTests"] : "global";
    var suiteName = requestJSON["suiteName"] ? requestJSON["suiteName"] : "";
    try {
      response.setBody({
        snboqId: CloudRunnerAPI.TestGenerationAPI.startJob({
            tableEncodedQuery: tableEncodedQuery,
            userEncodedQuery: userEncodedQuery,
            catalogEncodedQuery: catalogEncodedQuery,
            maxTestCount: maxTestCount,
            maxTestCountPerItem: maxTestCountPerItem,
            maxTestCountPerTable: maxTestCountPerTable,
            email: email,
            separateUpdateSetPerScope: separateUpdateSetPerScope,
            scopeForGeneratingTests: scopeForGeneratingTests,
			      suiteName: suiteName,
        })
      });
      
      response.setStatus(200);
    } catch (e) {
      response.setBody({
        message: e["message"]
      });
      response.setStatus(400);
    }

    

})(request, response);
