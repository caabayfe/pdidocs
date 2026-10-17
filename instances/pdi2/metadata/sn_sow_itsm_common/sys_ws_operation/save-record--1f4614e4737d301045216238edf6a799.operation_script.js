(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var requestData = request.body.data;
    var table = request.pathParams.table;
    var sysId = request.pathParams.sys_id;
    var data = requestData.data;
    if (!table)
        return new sn_ws_err.BadRequestError("Table not provided");
    var gr = new GlideRecordSecure(table);
    if (gr.get(sysId) && gr.canWrite()) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) 
                    gr[key] = data[key];
        }
        if (gr.update()) {
            response.setBody({
                status: 'success'
            });
        } else {
            response.setBody({
                status: 'error'
            });
        }
    }
    else
    	return new sn_ws_err.BadRequestError("You do not have permissions to modify this record");

})(request, response);
