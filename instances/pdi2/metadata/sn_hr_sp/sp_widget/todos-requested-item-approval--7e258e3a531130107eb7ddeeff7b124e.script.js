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
        data.ritmSysId = getRitmIdFromApproval(data.sysId);
        data.detailsHeaderWidget = $sp.getWidget("todos-approval-details-header", {
            approvalType: data.CONST.APPROVAL_TYPE,
            approvalSysId: data.sysId
        });
        data.ritmVariablesWidget = $sp.getWidget("requested-item-variables", {
            sysId: data.ritmSysId,
            isExpanded: true
        });
        data.approvalActionsWidget = $sp.getWidget("todo-approval-actions", {
            sysId: data.sysId,
            useCommentBox: false,
            commentId: options.commentId,
            commentTable: options.commentTable
        });
        data.ritmTotalPrice = getPriceFromRitmId(data.ritmSysId);
    }

    function getRitmIdFromApproval(approvalSysId) {
        var approvalGr = new GlideRecordSecure("sysapproval_approver");
        if (approvalGr.get(approvalSysId)) {
            if (approvalGr.document_id)
                return approvalGr.document_id.toString();
            else
                return approvalGr.sysapproval.toString();
        } else {
            gs.error(gs.getMessage("Todos Requested Item: Error reading Approval record"));
            return null;
        }
    }

    function getPriceFromRitmId(ritmSysId) {
        var formatter = new sn_currency.GlideCurrencyFormatter();
        var ritmGr = new GlideRecordSecure("sc_req_item");
        if (ritmGr.get(ritmSysId)) {
            var currencyCode = ritmGr.price.getSessionCurrencyCode();
            var totalPrice = formatter.format(ritmGr.getValue('price') * ritmGr.getDisplayValue('quantity'), currencyCode);
            return totalPrice;
        } else {
            gs.error(gs.getMessage("Todos Requested Item: Error reading Requested Item record"));
            return null;
        }
    }
})();
