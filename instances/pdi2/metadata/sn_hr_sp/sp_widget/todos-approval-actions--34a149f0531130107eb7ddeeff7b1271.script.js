(function() {
    data.CONST = {
        i18n: {
            PLACEHOLDER_MESSAGE: gs.getMessage("If you are rejecting the request, provide the reason here."),
            REJECT_MODAL_TITLE: gs.getMessage("Reject Request"),
            REJECT_MODAL_MESSAGE: gs.getMessage("Please provide a reason for rejecting the request"),
            REJECT_MODAL_CANCEL: gs.getMessage("Cancel"),
            REJECT_MODAL_SUBMIT: gs.getMessage("Reject Request"),
            REJECT_MODAL_NO_COMMENT_MESSAGE: gs.getMessage("Provide the reason you are rejecting the request in the comments field."),
            REAUTH_FAILED_MESSAGE: gs.getMessage('An error occurred during authentication. Please contact your system administrator.')
        },
        ACTION: "updateApprovals",
        REJECT_STATE: "rejected",
        APPROVED_STATE: "approved",
        REQUESTED_STATE: "requested",
        APPROVAL_TABLE: "sysapproval_approver"
    };

    data.sysId = input && input.sysId ? input.sysId : options.sysId;
    data.commentId = input && input.commentId ? input.commentId : options.commentId;
    data.commentTable = input && input.commentTable ? input.commentTable : options.commentTable;
    data.useCommentBox = input && input.useCommentBox ? input.useCommentBox : options.useCommentBox;

    if (data.sysId) {
        var todoApprovalActionsUtil = new sn_ex_sp.TodoApprovalActionsUtil();
        var approvalGr = todoApprovalActionsUtil.getTargetRecord(data.sysId, data.CONST.APPROVAL_TABLE);
        if (!gs.nil(approvalGr)) {
            data.esignRequiredObj = todoApprovalActionsUtil.getEsignObj(approvalGr);
            data.isApprover = todoApprovalActionsUtil.isApprover(approvalGr);
            if (data.isApprover) {
                data.isPosted = false;
                var commentGr = null;
                if (data.commentId && data.commentTable) {
                    commentGr = todoApprovalActionsUtil.getTargetRecord(data.commentId, data.commentTable);
                    if (!gs.nil(commentGr)) {
                        data.requireRejectionComment = todoApprovalActionsUtil.checkRejectionCommentRequired(commentGr);
                        data.useCommentBox = data.useCommentBox && data.requireRejectionComment;
                    }
                }
                if (input && input.action === data.CONST.ACTION) {
                    input.request.requireRejectionComment = data.requireRejectionComment;
                    input.request.useCommentBox = data.useCommentBox;
                    data.isPosted = todoApprovalActionsUtil.updateApprovalAndComment(approvalGr, commentGr, input.request);
                    if (data.isPosted && !gs.nil(commentGr)) {
                        setPostApprovalInfo(todoApprovalActionsUtil.getPostApprovalInfo(approvalGr, commentGr));
                    }
                } else if (data.commentId && data.commentTable) {
                    if (approvalGr.state.toString() !== data.CONST.REQUESTED_STATE) {
                        data.isPosted = true;
                        if (!gs.nil(commentGr)) {
                            setPostApprovalInfo(todoApprovalActionsUtil.getPostApprovalInfo(approvalGr, commentGr));
                        }
                    }
                }
            }
        }
    }

    /**
     * Sets the last comments and timestamp of the approval to data
     */
    function setPostApprovalInfo(postApprovalInfo) {
        data.caption = postApprovalInfo.caption;
        data.comment = postApprovalInfo.comment;
        data.timestamp = postApprovalInfo.timestamp;
    }
})();
