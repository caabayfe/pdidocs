(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var params = request.body.nextEntry();
    var actionId = params.actionId;
    var actionInputs = JSON.parse(params.actionInputs);
    var table = params.table;
    var context = params.context;

    if (!gs.nil(table) && !gs.nil(context)) {
        gr = new GlideRecord(table);
        gr.get(context);
        if (gr.canRead()) {
            var clientCall = new sn_ex_sp.ActionUtil(gr);
            clientCall.toggleParameterTypes();
            var actionOutput = clientCall.executeActionServerScript(actionId, actionInputs);
            response.setBody({
                actionOutput: actionOutput
            });
        }
    }

})(request, response);
