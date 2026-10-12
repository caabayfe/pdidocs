(function() {
    data.CONST = {
        i18n: {
            REQUESTED_BY: gs.getMessage("Requested by"),
            REQUESTED_FOR: gs.getMessage("Requested for"),
            OPENED_BY: gs.getMessage("Opened by"),
            OPENED_FOR: gs.getMessage("Opened for"),
            CREATED: gs.getMessage("Created Date"),
            UPDATED: gs.getMessage("Updated Date"),
            SHORT_DESC: gs.getMessage("Short Description"),
            HR_SERVICE: gs.getMessage("HR Service")
        },
        ITEM_TYPES: {
            REQUESTED_BY: "requested_by",
            REQUESTED_FOR: "requested_for",
            OPENED_BY: "opened_by",
            OPENED_FOR: "opened_for",
            CREATED: "sys_created_on",
            UPDATED: "sys_updated_on",
            SHORT_DESC: "short_description",
            HR_SERVICE: "hr_service"
        },
        APPROVAL_TYPES: {
            RITM_OR_REQ: "ritm_or_req",
            HR_CASE: "hr_case"
        }
    };

    if (options && options.approvalType && options.approvalSysId) {
        var approvalGr = new GlideRecordSecure("sysapproval_approver");
        if (approvalGr && approvalGr.get(options.approvalSysId)) {
            data.approvalSysId = options.approvalSysId;
            data.detailHeaderItems = [];
            var taskGr = getTaskRecord();
            if (options.approvalType === data.CONST.APPROVAL_TYPES.RITM_OR_REQ) {
                populateItemsRitmOrReq(taskGr);
            } else if (options.approvalType === data.CONST.APPROVAL_TYPES.HR_CASE) {
                populateItemsHRCase(taskGr);
            } else
                gs.error(gs.getMessage("Todos Approval Details Header: Unknown approval type"));
        } else
            gs.error(gs.getMessage("Todos Approval Details Header: Could not locate approval with sys id {0}", options.approvalSysId));
    }

    /**
     * Populate data.detailHeaderItems with items required for an REQ or RITM type approval
     * REQ/RITM approvals requires Requested by and Requested for
     */
    function populateItemsRitmOrReq(taskGr) {
        // Requested for
        if (taskGr && taskGr.requested_for) {
            data.detailHeaderItems.push({
                type: data.CONST.ITEM_TYPES.REQUESTED_FOR,
                contentDetails: taskGr.requested_for.getDisplayValue(),
                userSysId: taskGr.requested_for.toString(),
                label: data.CONST.i18n.REQUESTED_FOR
            });
        }
        // Requested by
        if (taskGr && taskGr.opened_by && taskGr.opened_by != taskGr.opened_for) {
            data.detailHeaderItems.push({
                type: data.CONST.ITEM_TYPES.REQUESTED_BY,
                contentDetails: taskGr.opened_by.getDisplayValue(),
                userSysId: taskGr.opened_by.toString(),
                label: data.CONST.i18n.REQUESTED_BY
            });
        }
    }

    /**
     * Populate data.detailHeaderItems with items required for an HR CASE type approval
     * HR CASE approvals requires Requested by and Requested for
     */
    function populateItemsHRCase(taskGr) {

        // Opened for
        if (taskGr && taskGr.opened_for) {
            data.detailHeaderItems.push({
                type: data.CONST.ITEM_TYPES.OPENED_FOR,
                contentDetails: taskGr.opened_for.getDisplayValue(),
                userSysId: taskGr.opened_for.toString(),
                label: data.CONST.i18n.OPENED_FOR
            });
        }
        // Opened by
        if (taskGr && taskGr.opened_by && taskGr.opened_by != taskGr.opened_for) {
            data.detailHeaderItems.push({
                type: data.CONST.ITEM_TYPES.OPENED_BY,
                contentDetails: taskGr.opened_by.getDisplayValue(),
                userSysId: taskGr.opened_by.toString(),
                label: data.CONST.i18n.OPENED_BY
            });
        }
        // Created
        if (taskGr && taskGr.sys_created_on) {
            data.detailHeaderItems.push({
                type: data.CONST.ITEM_TYPES.CREATED,
                contentDetails: taskGr.sys_created_on.getDisplayValue(),
                label: data.CONST.i18n.CREATED
            });
        }
        // Updated
        if (taskGr && taskGr.sys_updated_on) {
            data.detailHeaderItems.push({
                type: data.CONST.ITEM_TYPES.UPDATED,
                contentDetails: taskGr.sys_updated_on.getDisplayValue(),
                label: data.CONST.i18n.UPDATED
            });
        }
        // Short Description
        if (taskGr && taskGr.short_description) {
            data.detailHeaderItems.push({
                type: data.CONST.ITEM_TYPES.SHORT_DESC,
                contentDetails: taskGr.short_description.getDisplayValue(),
                label: data.CONST.i18n.SHORT_DESC
            });
        }
        // HR Service
        if (taskGr && taskGr.hr_service) {
            data.detailHeaderItems.push({
                type: data.CONST.ITEM_TYPES.HR_SERVICE,
                contentDetails: getHRServiceDisplayValue(taskGr.hr_service),
                label: data.CONST.i18n.HR_SERVICE
            });
        }
    }

    /**
     * Get task glide record from approval glide record
     */
    function getTaskRecord() {
        var taskTable = approvalGr.document_id.getReferenceTable();
        var taskSysId = "";
        if (taskTable)
            taskSysId = approvalGr.document_id.toString();
        else {
            // Use the sysapproval field (must convert to GlideRecord to get correct extended table)
            taskTable = approvalGr.sysapproval.getRefRecord().getTableName();
            taskSysId = approvalGr.sysapproval.toString();
        }
        var result = new GlideRecordSecure(taskTable);
        if (!result.get(taskSysId)) {
            gs.error(gs.getMessage("Todos Approval Details Header: Cannot find task associated with approval"));
            return null;
        }
        return result;
    }

    function getHRServiceDisplayValue(hrServiceID)
    { 
        if(!hrServiceID)
            return "";
  
        var hrService = new GlideRecord('sn_hr_core_service');
        if(hrService.get(hrServiceID))
            return hrService.getDisplayValue();     
        
        return "";
    }
})();
