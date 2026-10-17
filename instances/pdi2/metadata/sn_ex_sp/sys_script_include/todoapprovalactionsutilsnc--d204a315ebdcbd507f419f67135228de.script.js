var TodoApprovalActionsUtilSNC = Class.create();
TodoApprovalActionsUtilSNC.prototype = {
    initialize: function() {
        this.CONST = {
            REJECT_STATE: "rejected",
            APPROVED_STATE: "approved"
        };
    },

    /**
     * Checks if the user is approver for giver approval record
     * @param {GlideRecord} approvalGr The approval record to check for approver
     * @return {Boolean} True if user is a valid approver, false otherwise
     */
    isApprover: function(approvalGr) {
        return approvalGr.state != 'undefined' && approvalGr.state.canWrite();
    },

    /**
     * Gets the esignature object for the given approval record
     * @param {GlideRecord} approvalGr The approval record to check for esignture
     * @return {Object} with username, userSysId and e_sign_required
     */
    getEsignObj: function(approvalGr) {
        var esignature = {
            username: gs.getUserName(),
            userSysId: gs.getUserID(),
            e_sign_required: GlidePluginManager.isActive('com.glide.e_signature_approvals')
        };
        if (esignature.e_sign_required) {
            var esigUtils = new global.ESignatureUtils();
            if (typeof esigUtils.isApprovalEnabled === 'function')
                esignature.e_sign_required = esigUtils.isApprovalEnabled(approvalGr);
            else
                esignature.e_sign_required = esigUtils.isTableEnabled(approvalGr.source_table);
        }
        return esignature;
    },

    /**
     * Gets the glide record given a sys id
     * @param {String} sysId The sys_id of the record
     * @param {String} tableName The name of the record's table
     * @return {GlideRecord} A glide record
     */
    getTargetRecord: function(sysId, tableName) {
        var targetGr = new GlideRecord(tableName);
        if (!targetGr.get(sysId)) {
            gs.error("Could not find target record");
            return null;
        }
        return targetGr.canWrite() ? targetGr : null;
    },

    /**
     * Checks user write permissions to determine whether or not a rejection comment
     * is required from them to update the approval state
     * @param {GlideRecord} commentGr The record to check if comments can be written
     * @return {Boolean} True if comment is required, false otherwise
     */
    checkRejectionCommentRequired: function(commentGr) {
        if (!commentGr) {
            gs.error("Could not find Activity Stream record");
            return false;
        }
        return typeof commentGr.comments != 'undefined' && commentGr.comments.canWrite();
    },

    /**
     * Updates the state of the approval
     * @param {GlideRecord} approvalGr The approval record 
     * @param {GlideRecord} commentGr The comment record
     * @param {Object} request An object describing the update request
     * @return {Boolean} Returns true on successful update, false otherwise
     */
    updateApprovalAndComment: function(approvalGr, commentGr, request) {
        if (request.state === this.CONST.REJECT_STATE) {
            if (request.requireRejectionComment && request.useCommentBox && !request.comments) {
                gs.addErrorMessage(gs.getMessage("Provide the reason you are rejecting the request in the comments field."));
                return false;
            } else if (request.comments) {
                commentGr.comments = gs.getMessage('Reason for rejection: {0}', request.comments);
                commentGr.update();
            }
            var displayMessage = gs.getMessage("You rejected this request");
        } else if (request.state === this.CONST.APPROVED_STATE) {
            if (request.comments) {
                commentGr.comments = gs.getMessage('Reason for approval: {0}', request.comments);
                commentGr.update();
            }
            var displayMessage = gs.getMessage("You approved this request");
        } else
            return false;

        // Set state and update
        approvalGr.state = request.state;
        if (approvalGr.update()) {
            gs.addInfoMessage(displayMessage);
            return true;
        } else {
            gs.addErrorMessage(gs.getMessage("Could not update approval record."));
            return false;
        }
    },

    /**
     * @param {GlideRecord} approvalGr The approval record 
     * @param {GlideRecord} commentGr The comment record
     * @return {Object} with caption,last comments and timestamp of the approval to data
     */
    getPostApprovalInfo: function(approvalGr, commentGr) {
        var postApprovalInfo = {};
        postApprovalInfo.caption = gs.getMessage("The request was {0}", approvalGr.state.getDisplayValue());
        var dateRE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}.*\n/;
        if (commentGr.comments) {
            var journalEntryComment = commentGr.comments.getJournalEntry(1);
            postApprovalInfo.comment = journalEntryComment.replace(dateRE, '').toString();
        }
        postApprovalInfo.timeStamp = approvalGr.sys_updated_on.toString();
        return postApprovalInfo;
    },

    type: 'TodoApprovalActionsUtilSNC'
};
