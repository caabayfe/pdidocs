const ApprovalUtils = (function() {
    /**
     * Much of this class is borrowed from sn_aemc.CustomAppUtils and modified for our usecase. 
     * Thank you AEMC team! Now we can approve/reject new application tasks in AEMC. 
     * 
     * Right now this could be used generically for basic approvals. 
     * But handling could be expanded if more complex approval logic is needed.  
     */
    function getApprovalRecord(requestId) {
        if (requestId) {
            try {
                var approvalRec = new GlideRecordSecure("sysapproval_approver");
                approvalRec.addQuery("sysapproval", requestId);
                approvalRec.addQuery("approver", gs.getUserID());
                approvalRec.addQuery("state", "requested");
                approvalRec.query();

                if (approvalRec.next()) {
                    return approvalRec;
                }
            } catch (exception) {
                gs.warn(exception);
            }
        }
        return null;
    }

    function setApprovalState(approvalRec, state) {
        if (approvalRec) {
            approvalRec.setValue('state', state);
            return !!approvalRec.update();
        }
        return false;
    }

    return class ApprovalUtils {
        static canApproveReject(request) {
            const record = getApprovalRecord(request?.getUniqueValue());
            return !!record;
        }

        static approve(request) {
            const approvalRecord = getApprovalRecord(request?.getUniqueValue());
            return setApprovalState(approvalRecord, 'approved');
        }

        static reject(request) {
            const approvalRecord = getApprovalRecord(request?.getUniqueValue());
            return setApprovalState(approvalRecord, 'rejected');
        }
    };
})();
