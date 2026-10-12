(function() {
    var REQUESTED_STATE = "requested";

    if (options && options.sysId) {
        data.approvalId = options.sysId;
        getApprovalInfo(data.approvalId);
        options.useCommentBox = true;
        data.approvalActionsWidget = $sp.getWidget("todo-approval-actions", options);
   }

    //This function gets ShortDescription of the parent case.
    function getApprovalInfo(sysId) {
        var sysApprovalRecord = new GlideRecordSecure('sysapproval_approver');
        data.shortDescription = "";
        if (sysApprovalRecord.get(sysId)) {
            data.isPosted = false;
            if (sysApprovalRecord.state.toString() !== REQUESTED_STATE)
                data.isPosted = true;
            if (!gs.nil(sysApprovalRecord.sysapproval) && !gs.nil(sysApprovalRecord.sysapproval.short_description))
                data.shortDescription = sysApprovalRecord.sysapproval.short_description;
            else if (!gs.nil(sysApprovalRecord.document_id))
                data.shortDescription = !gs.nil(sysApprovalRecord.document_id.short_description) ? (sysApprovalRecord.document_id.number + " - "+ sysApprovalRecord.document_id.short_description) : sysApprovalRecord.document_id.number;
            else
                data.shortDescription = !gs.nil(sysApprovalRecord.sysapproval) ? sysApprovalRecord.sysapproval.number: "";
        data.approvalText = gs.getMessage("Do you want to approve the following: {0}?", data.shortDescription);
        } else
            gs.addErrorMessage(gs.getMessage("Unexpected action occurred"));
        return sysApprovalRecord;
   }

})();
