(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var requestBody = request.body;
    var requestData = requestBody.data;
    var dict = requestData.dictionary_entries;
    var dataClass = requestData.data_classes;

    return new SNC.DCManager().addClassification(dict, dataClass);
    })(request, response);
