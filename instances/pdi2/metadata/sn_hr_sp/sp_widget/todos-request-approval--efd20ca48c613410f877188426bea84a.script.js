(function() {
    data.CONST = {
        i18n: {
            REQUESTED_ITEMS: gs.getMessage("Requested items"),
            CATALOG_ITEMS: gs.getMessage("Catalog items"),
            PRICE: gs.getMessage("Price"),
            QUANTITY: gs.getMessage("Quantity"),
            TOTAL: gs.getMessage("Total"),
            TOTAL_PRICE: gs.getMessage("Total price : ")
        },
        APPROVAL_TYPE: "ritm_or_req"
    };

    if (options && options.sysId) {
        data.sysId = options.sysId;
        data.reqSysId = getReqIdFromApproval(data.sysId);
        data.ritmTotalPrice = 0;

        data.detailsHeaderWidget = $sp.getWidget("todos-approval-details-header", {
            approvalType: data.CONST.APPROVAL_TYPE,
            approvalSysId: data.sysId
        });
        data.approvalActionsWidget = $sp.getWidget("todo-approval-actions", {
            sysId: data.sysId,
            useCommentBox: false,
            commentId: options.commentId,
            commentTable: options.commentTable
        });

        setRitmTotalPrice(data.reqSysId);
        setRitms(data.reqSysId);
    }

    function setRitmTotalPrice(sysId) {
        var reqGR = new GlideRecordSecure("sc_request");
        if (reqGR.get(data.reqSysId)) 
            data.ritmTotalPrice = reqGR.price.getSessionDisplayValue();
    }

    function setRitms(sysId) {
        var items = [];
        var itemsGR = new GlideRecordSecure("sc_req_item");
        itemsGR.addQuery("request", data.reqSysId);
        itemsGR.query();
        while (itemsGR.next()) {
            var item = {};
            item.short_description = itemsGR.short_description.toString();
            if (itemsGR.getValue("price") > 0)
                item.price = itemsGR.getDisplayValue("price");
            if (itemsGR.getValue("recurring_price") > 0) {
                item.recurring_price = itemsGR.getDisplayValue("recurring_price");
                item.recurring_frequency = itemsGR.getDisplayValue("recurring_frequency");
            }
            item.ritmVariablesWidget = $sp.getWidget("requested-item-variables", {
                sysId: itemsGR.getUniqueValue(),
                isExpanded: itemsGR.getRowCount() === 1
            });
            items.push(item);
        }
        data.items = items;
    }

    function getRecordBeingApproved(gr) {
        var approvalTargetRecord;
        if (!gr.sysapproval.nil())
            approvalTargetRecord = gr.sysapproval.getRefRecord();
        else
            approvalTargetRecord = gr.document_id.getRefRecord();

        return (approvalTargetRecord.canRead()) ? approvalTargetRecord : null;
    }

    function getReqIdFromApproval(approvalSysId) {
        var approvalGr = new GlideRecordSecure("sysapproval_approver");
        if (approvalGr.get(approvalSysId)) {
            if (approvalGr.document_id)
                return approvalGr.document_id.toString();
            else
                return approvalGr.sysapproval.toString();
        } else {
            gs.error(gs.getMessage("Todos Request: Error reading Approval record"));
            return null;
        }
    }

    function getPriceFromRitmId(ritmSysId) {
        var ritmGr = new GlideRecordSecure("sc_req_item");
        if (ritmGr.get(ritmSysId)) {
            return ritmGr.getDisplayValue("price");
        } else {
            gs.error(gs.getMessage("Todos Requested Item: Error reading Requested Item record"));
            return null;
        }
    }
})();
