var PlatformDocRuleUtils = Class.create();
var DS_DOCUMENT_TABLE = "ds_document";
var DS_APPROVAL_REVISION_RULE_TABLE = "ds_approval_revision_rule";
var DS_APPROVAL_REVISION_RULE_REVIEWER_TABLE = "ds_approval_revision_rule_reviewer";
var DS_APPROVAL_REVISION_RULE_APPROVER_TABLE = "ds_approval_revision_rule_approver";
var DS_DOCUMENT_APPROVER_TABLE = "ds_document_approver";
var DS_DOCUMENT_REVIEWER_TABLE = "ds_document_reviewer";
var APPROVER_ATTRIBUTES = ["approver", "sequence"];
var REVIEWER_ATTRIBUTES = ["reviewer"];

PlatformDocRuleUtils.prototype = {

    initialize: function(documentSysId) {
        this.platformDocMgmt = new PlatformDocMgmt();
        this.platformDocMgmtDB = new PlatformDocMgmtDB();
        this.documentRecord = new GlideRecord(DS_DOCUMENT_TABLE);
        this.approvalRevisionRules = new GlideRecord(DS_APPROVAL_REVISION_RULE_TABLE);
        this.approvalRevisionRules.query();

        this.documentSysId = documentSysId;
        this.documentRecord.get(documentSysId);
        this.matchingApprovalRevisionRules = new Array();
        this._initMatchingApprovalRevisionRulesSysId();
    },

    _initMatchingApprovalRevisionRulesSysId: function() {
        var filter = GlideFilter;
        while (this.approvalRevisionRules.next()) {
            var approvalRevisionRule = this.approvalRevisionRules;
            var match = filter.checkRecord(this.documentRecord, approvalRevisionRule.condition);
            if (match && approvalRevisionRule.active == "1") {
                this.matchingApprovalRevisionRules.push(approvalRevisionRule.getValue("sys_id"));
            }
        }
    },

    _isInArray: function(newUser, userList, attributesToCheck) {
        for (var i = 0; i < userList.length; i++) {
            var existingUser = userList[i];
            if (this.platformDocMgmt.areObjectAttributesEqual(newUser, existingUser, attributesToCheck)) {
                return true;
            }
        }
        return false;
    },

    getApproverUsers: function() {
        var matchingUserApprovers = new Array();

        if (this.matchingApprovalRevisionRules.length == 0) {
            return matchingUserApprovers;
        }
        var approverUsers = new GlideRecord(DS_APPROVAL_REVISION_RULE_APPROVER_TABLE);
        approverUsers.addQuery("approval_review_ruleIN" + this.matchingApprovalRevisionRules.toString());
        approverUsers.query();

        while (approverUsers.next()) {
            var newApprover = this.platformDocMgmt.createObject(approverUsers);
            if (!this._isInArray(newApprover, matchingUserApprovers, APPROVER_ATTRIBUTES)) {
                matchingUserApprovers.push(newApprover);
            }
        }

        return matchingUserApprovers;
    },

    getReviewerUsers: function() {
        var matchingUserReviewers = new Array();

        if (this.matchingApprovalRevisionRules.length == 0) {
            return matchingUserReviewers;
        }
        var reviewerUsers = new GlideRecord(DS_APPROVAL_REVISION_RULE_REVIEWER_TABLE);
        reviewerUsers.addQuery("approval_review_ruleIN" + this.matchingApprovalRevisionRules.toString());
        reviewerUsers.query();

        while (reviewerUsers.next()) {
            var newReviewer = this.platformDocMgmt.createObject(reviewerUsers);
            if (!this._isInArray(newReviewer, matchingUserReviewers, REVIEWER_ATTRIBUTES)) {
                matchingUserReviewers.push(newReviewer);
            }
        }

        return matchingUserReviewers;
    },

    getSequenceForApproval: function() {
        var arrayUtil = new ArrayUtil();
        var approverSequence = [];

        var approverGR = new GlideRecord(DS_DOCUMENT_APPROVER_TABLE);
        approverGR.addQuery('document', this.documentSysId);
        approverGR.query();

        while (approverGR.next()) {
            var sequence = approverGR.getValue("sequence");
            approverSequence.push(parseInt(sequence, 10));
        }

        approverSequence = arrayUtil.unique(approverSequence);
        return approverSequence.sort(function(a, b) {
            return a - b;
        });
    },

    getApproversAtSequence: function(sequence) {
        var approverUser = new GlideRecord(DS_DOCUMENT_APPROVER_TABLE);
        approverUser.addQuery("document", this.documentSysId);
        approverUser.addQuery("sequence", sequence);
        approverUser.query();

        var approversSysID = "";
        while (approverUser.next()) {
            var approverID = approverUser.getValue('approver');
            approversSysID += approverID + ",";
        }
        return approversSysID.slice(0, -1);
    },

    addApproversAndReviewers: function() {
        this._addReviewersFromRules();
        this._addApproversFromRules();
    },

    refreshApproversAndReviewers: function() {
        this._deleteSystemGeneratedApprovers();
        this._deleteSystemGeneratedReviewers();
        this._addReviewersFromRules();
        this._addApproversFromRules();
    },

    _addApproversFromRules: function() {
        var approverUsers = this.getApproverUsers();
        for (var i = 0; i < approverUsers.length; i++) {
            var userApprover = new Object();
            userApprover.document = this.documentSysId;
            userApprover.approver = approverUsers[i].approver;
            userApprover.sequence = approverUsers[i].sequence;
            userApprover.generated_by = "system";
            this.platformDocMgmtDB.insert(userApprover, DS_DOCUMENT_APPROVER_TABLE);
        }
    },

    _addReviewersFromRules: function() {
        var reviewerUsers = this.getReviewerUsers();
        for (var i = 0; i < reviewerUsers.length; i++) {
            var userReviewer = new Object();
            userReviewer.document = this.documentSysId;
            userReviewer.reviewer = reviewerUsers[i].reviewer;
            userReviewer.generated_by = "system";
            this.platformDocMgmtDB.insert(userReviewer, DS_DOCUMENT_REVIEWER_TABLE);
        }
    },

    _deleteSystemGeneratedApprovers: function() {
        var approverUser = new GlideRecord(DS_DOCUMENT_APPROVER_TABLE);
        approverUser.addQuery("document", this.documentSysId);
        approverUser.addQuery("generated_by", "system");
        approverUser.query();
        approverUser.deleteMultiple();
    },

    _deleteSystemGeneratedReviewers: function() {
        var reviewerUser = new GlideRecord(DS_DOCUMENT_REVIEWER_TABLE);
        reviewerUser.addQuery("document", this.documentSysId);
        reviewerUser.addQuery("generated_by", "system");
        reviewerUser.query();
        reviewerUser.deleteMultiple();
    },

    type: 'PlatformDocRuleUtils'
};
