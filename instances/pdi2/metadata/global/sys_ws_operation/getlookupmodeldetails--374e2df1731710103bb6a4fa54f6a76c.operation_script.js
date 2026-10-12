(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var result = {};
    try {
        var data = request.body.data;
        var lookupIds = data && data.lookupIds;
        if (lookupIds && Array.isArray(lookupIds) && lookupIds.length > 0) {
            lookupIds.forEach(function(eachId) {
                result[eachId] = new NLULookup(eachId).getStatus();
            });
        } else
            return new sn_ws_err.BadRequestError('No input data provided');
    } catch (e) {
        return e;
    }
    return result;

})(request, response);
