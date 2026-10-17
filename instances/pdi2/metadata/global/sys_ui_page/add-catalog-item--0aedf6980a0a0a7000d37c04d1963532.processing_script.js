(function() {
    var canReadOrWrite = canAddItemToRequest(prequest);

    if (canReadOrWrite.canRead && (gs.getProperty('glide.sc.request.add_item_write_access') != 'true' || canReadOrWrite.canWrite)) {
        updateRequest();
        gs.addInfoMessage(gs.getMessage("Item added to request successfully"));
    }
    else
        gs.addErrorMessage(gs.getMessage("Unable to process the request"));

    function updateRequest() {
        var reqHelper = new GlideappCalculationHelper;
        reqHelper.addItemToExistingRequest(prequest, request.getParameter("item_ref_field"), myquantity);
        reqHelper.rebalanceRequest(prequest);
        var urlOnStack = GlideSession.get().getStack().bottom();
        response.sendRedirect(urlOnStack);
    }

    function canAddItemToRequest(request) {
        var gr = new GlideRecord('sc_request');
        var permission = {
            canRead: false,
            canWrite: false
        };
        if (gr.get(request) && gr.isValidRecord()) {
            permission.canRead = gr.canRead();
            permission.canWrite = gr.canWrite();
        }
        return permission;
    }
})();
