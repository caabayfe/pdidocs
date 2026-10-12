(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var payload = request.body.data;
    if (global.JSUtil.isEmpty(payload))
        return new sn_ws_err.BadRequestError("No Query String provided");

	var processedIds = [];
    payload.forEach(function(context) {
        var blockId = context.block_id;
        var cbContext = context.content_block_context;
        var newCbContext = "";
        var uniqueId;
        if (context && context.id && !(typeof context.id === 'object')) {
            uniqueId = context.id;
            newCbContext = {
                [context.id]: cbContext
            };
        }
        var blockGR = new GlideRecord('sn_ace_content_block_context');
        if (blockGR.get('content_block_id', blockId) && uniqueId) {
            var olderCbContext = blockGR.getValue('context_payload');
            olderCbContext = JSON.parse(olderCbContext);
            if (olderCbContext) {
                olderCbContext[uniqueId] = cbContext;
                blockGR.setValue('context_payload', JSON.stringify(olderCbContext));
                blockGR.update();

            }
        } else if (blockGR.get('content_block_id', blockId)) {
            blockGR.setValue('context_payload', JSON.stringify(cbContext));
            blockGR.update();
        } else {
            blockGR.setValue('content_block_id', blockId);
            blockGR.setValue('context_payload', newCbContext ? JSON.stringify(newCbContext) : JSON.stringify(cbContext));
            blockGR.insert();
        }
		processedIds.push(blockGR.getUniqueValue());
    });

    response.setBody({
        processedIds : processedIds
    });
})(request, response);
