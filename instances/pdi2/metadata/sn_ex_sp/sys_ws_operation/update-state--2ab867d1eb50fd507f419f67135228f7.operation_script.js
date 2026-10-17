(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var CONST = {
        APPROVAL_TABLE: "sysapproval_approver"
    };

    var params = request.body.nextEntry();
    var sysId = params.sysId;
    var commentId = params.commentId;
    var commentTable = params.commentTable;
    var approvalObj = {
        state: params.state,
        comments: params.comments,
        useCommentBox: params.useCommentBox
    };

    if (sysId) {
        var todoApprovalActionsUtil = new sn_ex_sp.TodoApprovalActionsUtil();
        var approvalGr = todoApprovalActionsUtil.getTargetRecord(sysId, CONST.APPROVAL_TABLE);
        if (!gs.nil(approvalGr)) {
            var isApprover = todoApprovalActionsUtil.isApprover(approvalGr);
            if (isApprover) {
                var isPosted = false;
                var commentGr = null;
                if (commentId && commentTable) {
                    commentGr = todoApprovalActionsUtil.getTargetRecord(commentId, commentTable);
                    if (!gs.nil(commentGr)) {
                        approvalObj.requireRejectionComment = todoApprovalActionsUtil.checkRejectionCommentRequired(commentGr);
                        approvalObj.useCommentBox = approvalObj.useCommentBox && approvalObj.requireRejectionComment;
                    }
                }

                isPosted = todoApprovalActionsUtil.updateApprovalAndComment(approvalGr, commentGr, approvalObj);
                if (isPosted && !gs.nil(commentGr)) {
                    var postApprovalInfo = todoApprovalActionsUtil.getPostApprovalInfo(approvalGr, commentGr);
                }
                response.setBody({
                    isPosted: isPosted,
                    postApprovalInfo: postApprovalInfo
                });
            }
        }
    }

})(request, response);
