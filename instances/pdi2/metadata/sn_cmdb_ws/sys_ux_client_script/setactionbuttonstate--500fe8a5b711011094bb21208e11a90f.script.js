/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        DM_POLICY_TYPE_IDS,
        DM_TASK_STATE
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const {
        hasDataManagerAdminOrAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();

    const actionButtonState = {
        cancel: {
            hide: true,
            disable: false
        },
        reassign: {
            hide: false,
            disable: false
        },
        reviewAttestation: {
            hide: true,
            disable: false
        },
        reviewCertification: {
            hide: true,
            disable: false
        },
        reviewApproval: {
            hide: true,
            disable: false
        }
    };

    if (api.data.task_detail_record.result && api.data.validate_task.output) {
        const taskDetailResult = api.data.task_detail_record.result;
        const validateTaskAssignmentResult = api.data.validate_task.output;

        const policyType = taskDetailResult.policy_id._reference.cmdb_policy_type.value;
        const state = taskDetailResult.state.value;
        const assignedTo = taskDetailResult.assigned_to.value;

        const isAdmin = hasDataManagerAdminOrAdminOrMaint(api.context.session.user.roles);
        const isAssignedToEmpty = !assignedTo;
        const isTaskAssignedToCurrentUser = assignedTo === api.context.session.user.sys_id;
        const isUserPartOfAssignmentGroup = !validateTaskAssignmentResult.userNotWithinGroup;
        const userCanUpdateTaskApproval = validateTaskAssignmentResult.userCanUpdateTaskApproval;
        const userManagesAssignee = validateTaskAssignmentResult.userManagesAssignee;
        const isTaskOpen = state === DM_TASK_STATE.OPEN;
        const isTaskClosed = state === DM_TASK_STATE.CLOSED_COMPLETE || state === DM_TASK_STATE.CLOSED_INCOMPLETE || state === DM_TASK_STATE.CLOSED_SKIPPED || state === DM_TASK_STATE.CLOSED_CANCELLED;
        const isTaskWorkInProgress = state === DM_TASK_STATE.WORK_IN_PROGRESS;
        const isAttestationTask = policyType === DM_POLICY_TYPE_IDS.NON_LIFECYCLE.ATTESTATION;
        const isCertificationTask = policyType === DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION;
        const isApprovalTask = (policyType != DM_POLICY_TYPE_IDS.NON_LIFECYCLE.ATTESTATION &&
            policyType != DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION);

        if (isAdmin) { // for admins show the cancel task button
            actionButtonState.cancel = {
                hide: false,
                disable: false
            };
        }

        if (isAttestationTask) {
            // users can review attestation task if there is no assigned_to field or the current user is assigned_to the task
            const enableReview = isTaskAssignedToCurrentUser || userManagesAssignee || (isUserPartOfAssignmentGroup && isAssignedToEmpty);
            actionButtonState.reviewAttestation = {
                hide: false,
                disable: !enableReview
            };

            if (isTaskClosed) {
                actionButtonState.reviewAttestation.disable = true;
                actionButtonState.reassign.disable = true;
                actionButtonState.cancel.disable = true;
            }

        }

        if (isApprovalTask) {
            // only enable review for open task and if either the user is assigned to the task or is part of the assignmen
            const enableReview = isTaskOpen && (isTaskAssignedToCurrentUser || isUserPartOfAssignmentGroup || userCanUpdateTaskApproval);
            actionButtonState.reviewApproval = {
                hide: false,
                disable: !enableReview
            };

            if (!isTaskOpen) {
                actionButtonState.reassign.disable = true;
                actionButtonState.cancel.disable = true;
            }
        }

        if (isCertificationTask) {
            const enableReview = isAdmin || isTaskAssignedToCurrentUser || userManagesAssignee || (isUserPartOfAssignmentGroup && isAssignedToEmpty);
            actionButtonState.reviewCertification = {
                hide: false,
                disable: !enableReview
            };

            if (isTaskClosed) {
                actionButtonState.reassign.disable = true;
                actionButtonState.cancel.disable = true;
            }
        }
    }
    api.setState("actionButtonState", actionButtonState);
}
