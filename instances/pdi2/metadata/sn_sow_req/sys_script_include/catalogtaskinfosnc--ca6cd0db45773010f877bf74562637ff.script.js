var CatalogTaskInfoSNC = Class.create();
CatalogTaskInfoSNC.prototype = {
    initialize: function(gr) {
        this._gr = gr;
        this._catalogSOWUtil = new sn_sow_req.CatalogSOWUtils();
    },
    getHeaderInfo: function() {
        var result = {};
        result.mainHeading = sn_i18n.Message.getMessage("sn_sow_req", "Record Information");
        var userGr = new GlideRecord('sys_user');
        userGr.addActiveQuery();
        userGr.addQuery("user_name", this._gr.getDisplayValue('sys_updated_by'));
        userGr.query();
        if (userGr.next() && userGr.getValue('name'))
            result.updateMsg = sn_i18n.Message.getMessage("sn_sow_req", "Last updated by {updatedBy}", {
                updatedBy: userGr.getValue('name')
            });
        else
            result.updateMsg = sn_i18n.Message.getMessage("sn_sow_req", "Last updated by {updatedBy}", {
                updatedBy: this._gr.getDisplayValue('sys_updated_by')
            });
        result.updatedTime = this._gr.sys_updated_on.getDisplayValue();
        return result;
    },
    getRequestedForInfo: function() {
        var reqItemGr = this._gr.request_item.getRefRecord();
        if (reqItemGr.isValidRecord()) {
            var requestedForGr = reqItemGr.requested_for.getRefRecord();
            var requestorInfo = this._catalogSOWUtil.getRequestedUserInfo(requestedForGr);
            requestorInfo.name = requestedForGr.getDisplayValue("name");
            requestorInfo.vip = requestedForGr.vip ? true : false;
            requestorInfo.sysId = requestedForGr.getUniqueValue();
            return requestorInfo;
        }
    },
    getSourceInfo: function() {
        var requestorInfo = this.getRequestedForInfo();
        var result = {
            requestorInfo: requestorInfo,
            sourceHeading: sn_i18n.Message.getMessage("sn_sow_req", "Requested for"),
            name: requestorInfo.name,
            vip: requestorInfo.vip,
            assigneeDetails: [{
                label: this._gr['opened_by'].getLabel(),
                value: {
                    type: "string",
                    value: this._gr.getDisplayValue('opened_by')
                }
            }]
        };
        return result;
    },

    getAssignedUserInfo: function() {
        var result = {};
        if (this._gr.getTableName() == 'sc_task') {
            result.isAssignedToFilled = true;
            result.hideEmptyState = true;
            result.emptyStateMsg = sn_i18n.Message.getMessage("sn_sow_req", "This catalog task has not been assigned yet");
            result.showAssignButton = Boolean(this._gr.active) && this._gr.canWrite();
            result.subHeading = this._gr.assigned_to.getLabel();
            if (!this._gr.assigned_to) {
                result.isAssignedToFilled = false;
                result.hideEmptyState = false;
                return result;
            }
            var assignedUserRef = this._gr.assigned_to.getRefRecord();
            result.avatar = assignedUserRef.isValidRecord() && assignedUserRef.avatar ? "/" + assignedUserRef.avatar + ".iix?t=small" : "";
            result.name = this._gr.getDisplayValue("assigned_to");
            if (this._gr.assignment_group && this.isMemberOfGroup(this._gr.getValue('assigned_to'), this._gr.getValue('assignment_group'))) {
                result.group = [{
                    "label": this._gr.getDisplayValue("assignment_group")
                }];
            } else {
                var group = this.getMemberGroup(this._gr.getValue('assigned_to'));
                result.group = group ? [{
                    "label": group
                }] : [];
            }
            return result;
        }
    },

    getAssignmentInfo: function() {
        var result = {};
        result.assignmentGroup = this._gr.getValue("assignment_group");
        result.assignedTo = this._gr.getValue("assigned_to");
        result.canWrite = this._gr.canWrite();
        result.loggedInUserHasAssignmentGroup = this.isMemberOfGroup(gs.getUserID(), result.assignmentGroup);
        return result;
    },	

    isMemberOfGroup: function(userId, groupId) {
        if (!groupId || !userId)
            return false;
        var groupGr = new GlideRecord('sys_user_grmember');
        groupGr.addQuery('group.active', true);
        groupGr.addQuery('group', groupId);
        groupGr.addQuery('user', userId);
        groupGr.query();
        return groupGr.hasNext();
    },

    getMemberGroup: function(userId) {
        if (!userId)
            return '';
        var groupGr = new GlideRecord('sys_user_grmember');
        groupGr.addQuery('group.active', true);
        groupGr.addQuery('user', userId);
        groupGr.setLimit(1);
        groupGr.query();
        if (groupGr.next()) {
            return groupGr.group.getDisplayValue();
        }
        return '';
    },
		
    getRecordInfo: function() {
        var result = {};
        result.headerInfo = this.getHeaderInfo();
        result.sourceInfo = this.getSourceInfo();
        result.assignmentInfo = this.getAssignmentInfo();
        result.assignedUserInfo = this.getAssignedUserInfo();
        return result;
    },

    type: 'CatalogTaskInfoSNC'
};
