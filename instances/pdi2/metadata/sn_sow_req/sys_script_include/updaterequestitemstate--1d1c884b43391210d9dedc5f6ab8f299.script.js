var UpdateRequestItemState = Class.create();
UpdateRequestItemState.prototype = {
    TABLES: {
        SC_REQ_ITEM: "sc_req_item",
        SYSAPPROVAL_APPROVER: "sysapproval_approver"
    },

    initialize: function() {},

    execute: function(sysId, action) {
        var requestItemGR = new GlideRecord(this.TABLES.SC_REQ_ITEM);
        if (requestItemGR.get(sysId) && this.isUserAuthorised(requestItemGR)) {
            if (action == 'deny')
                return this.reject(requestItemGR);
            else
                return this.accept(requestItemGR);
        } else {
            return {
                message: sn_i18n.Message.getMessage("sn_sow_req", "Could not cancel request item as it could not be located"),
                status: "failed"
            };
        }
    },

    isUserAuthorised: function(requestItemGR) {
        if (gs.hasRole("approval_admin"))
            return true;

        if (!gs.hasRole("approver_user"))
            return false;

        var approvalGR = new GlideRecord(this.TABLES.SYSAPPROVAL_APPROVER);
        approvalGR.addQuery("sysapproval", requestItemGR.getValue("request"));
        approvalGR.query();
        while (approvalGR.next()) {
            var isMyApproval = new ApprovalDelegationUtil().isMyApproval(approvalGR);
            if (isMyApproval)
                return true;
        }
        return false;
    },

    reject: function(requestItemGR) {
        requestItemGR.setValue("stage", "Request Cancelled");
        requestItemGR.setValue("approval", 'rejected');
        requestItemGR.setValue("state", 4);
        requestItemGR.update();
        return {
            message: sn_i18n.Message.getMessage("sn_sow_req", "Request Item {requestItem} has been cancelled", {
                requestItem: requestItemGR.number
            }),
            status: "success"
        };
    },

    accept: function(requestItemGR) {
        requestItemGR.setValue("stage", "waiting_for_approval");
        requestItemGR.setValue("approval", "requested");
        requestItemGR.update();
        return {
            message: sn_i18n.Message.getMessage("sn_sow_req", "Request Item {requestItem} has been accepted", {
                requestItem: requestItemGR.number
            }),
            status: "success"
        };
    },

    type: 'UpdateRequestItemState'
};
