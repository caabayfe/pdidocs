function todosApprovalController($scope, spModal, spAuthModal, $http, spUtil, $log) {
    /* widget controller */
    var c = this;

    $scope.onActionClick = function(state) {
        if (state === c.data.CONST.REJECT_STATE) {
            if (c.data.requireRejectionComment && !c.data.useCommentBox) {
                // Create an input popup
                spModal.open({
                    title: c.data.CONST.i18n.REJECT_MODAL_TITLE,
                    message: c.data.CONST.i18n.REJECT_MODAL_MESSAGE,
                    input: true,
                    buttons: [{
                            label: c.data.CONST.i18n.REJECT_MODAL_CANCEL,
                            cancel: true
                        },
                        {
                            label: c.data.CONST.i18n.REJECT_MODAL_SUBMIT,
                            primary: true
                        }
                    ]
                }).then(function(comment) {
                    if (c.data.esignRequiredObj.e_sign_required) {
                        openEsignatureModal(state, comment);
                    } else {
                        sendUpdateRequest(state, c.data.CONST.ACTION, comment);
                    }
                });
            } else {
                if ((c.data.requireRejectionComment && !c.data.comments)) {
                    spUtil.addErrorMessage(c.data.CONST.i18n.REJECT_MODAL_NO_COMMENT_MESSAGE);
                } else if (c.data.esignRequiredObj.e_sign_required) {
                    openEsignatureModal(state, c.data.comments);
                } else {
                    sendUpdateRequest(state, c.data.CONST.ACTION, c.data.comments);
                }
            }
        } else if (state === c.data.CONST.APPROVED_STATE) {
            if (c.data.esignRequiredObj.e_sign_required) {
                openEsignatureModal(state, c.data.comments);
            } else {
                sendUpdateRequest(state, c.data.CONST.ACTION, c.data.comments);
            }
        }
        return false; //prevents the form from submitting when the dialog first loads
    };

    function sendUpdateRequest(state, action, comment) {
        c.data.action = action;
        c.data.sysId = c.data.sysId;
        c.data.commentId = c.data.commentId;
        c.data.commentTable = c.data.commentTable;
        c.data.useCommentBox = c.data.useCommentBox;
        c.data.request = {
            state: state,
            comments: comment
        };
        c.server.update();
    }

    function openEsignatureModal(state, comment) {
        var requestParams = {
            username: c.data.esignRequiredObj.username,
            userSysId: c.data.esignRequiredObj.userSysId
        };
        spAuthModal.prompt(requestParams, requestParams.username, requestParams.userSysId).then(null, function() {
            alert(c.data.CONST.i18n.REAUTH_FAILED_MESSAGE);
        }).then(function() {
            $http.post('/api/sn_ex_sp/approvals/updateState', {
                sysId: c.data.sysId,
                commentId: c.data.commentId,
                commentTable: c.data.commentTable,
                useCommentBox: c.data.useCommentBox,
                state: state,
                comments: comment
            }).then(function(response) {
                if (response && response.data && response.data.result) {
                    c.getPostApprovalInfo(response.data.result);
                }
            }, function(reason) {
                spUtil.addErrorMessage(c.data.CONST.i18n.REAUTH_FAILED_MESSAGE);
                $log.error(reason);
            });
        });

        c.getPostApprovalInfo = function(result) {
            c.data.isPosted = result.isPosted;
            c.data.caption = result.postApprovalInfo.caption;
            c.data.comment = result.postApprovalInfo.comment;
            c.data.timestamp = result.postApprovalInfo.timestamp;
        }
    }
}
