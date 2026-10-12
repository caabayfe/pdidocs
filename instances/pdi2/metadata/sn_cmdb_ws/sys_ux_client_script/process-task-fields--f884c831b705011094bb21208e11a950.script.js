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
        buildFieldMetadata,
        DM_POLICY_TYPE_IDS,
        DM_TASK_STATE,
        PAGE_ROUTES
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    const taskType = {
        key: '',
        isAttestationTask: false,
        isCertificationTask: false,
        isApprovalTask: false
    };

    const fieldsMetadata = {
        attestation: {
            summaryFields: ['due_date', 'state', 'assigned_to', 'assignment_group'],
            // detailFields is array of array. each array element is shown on a row
            detailsFields: [
                ['sys_created_on', 'policy_id.cmdb_policy_type', 'policy_id'],
                ['short_description'],
                ['description']
            ]
        },
        certification: {
            summaryFields: ['due_date', 'state', 'assigned_to', 'assignment_group'],
            detailsFields: [
                ['sys_created_on', 'policy_id.cmdb_policy_type', 'policy_id'],
                ['short_description'],
                ['close_notes']
            ]
        },
        approval: {
            summaryFields: ['due_date', 'state', 'assigned_to', 'assignment_group'],
            detailsFields: [
                ['sys_created_on', 'policy_id.cmdb_policy_type', 'policy_id'],
                ['short_description']
            ]
        }
    };

    let fieldsMetadataForCurrentPolicyType;

    const getReferenceFieldRoute = (field, data) => {
        const routes = {
            assigned_to: {
                route: PAGE_ROUTES.RECORD,
                fields: {
                    table: 'sys_user',
                    sysId: data.value
                }
            },
            assignment_group: {
                route: PAGE_ROUTES.RECORD,
                fields: {
                    table: 'sys_user_group',
                    sysId: data.value
                }
            },
            policy_id: {
                route: PAGE_ROUTES.DM_POLICY_DETAILS,
                fields: {
                    policyRuntimeAttributesSysId: data.value
                }
            }
        };
        return routes[field];
    };

    if (api.data.task_detail_record &&
        api.data.task_detail_record.result
    ) {
        const rawData = api.data.task_detail_record.result;
        const policyType = rawData.policy_id._reference.cmdb_policy_type.value;
        taskType.key = policyType;
        if (policyType === DM_POLICY_TYPE_IDS.NON_LIFECYCLE.ATTESTATION) {
            taskType.isAttestationTask = true;
            fieldsMetadataForCurrentPolicyType = fieldsMetadata.attestation;
        } else if (policyType === DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION) {
            taskType.isCertificationTask = true;
            fieldsMetadataForCurrentPolicyType = fieldsMetadata.certification;
        } else {
            taskType.isApprovalTask = true;
            fieldsMetadataForCurrentPolicyType = fieldsMetadata.approval;
        }

        const processField = (field) => {
            let data = rawData[field];
            if (field.split('.').length > 1) {
                const parts = field.split('.');
                data = rawData[parts[0]]._reference[parts[1]];
            }
            if (data && data.displayValue) {
                data.hasNewLine = false;
                if (data.internalType === 'reference') {
                    const isAdmin = api.state.isUserDataManagerAdmin;
                    if (!isAdmin && field === 'policy_id') {
                        return buildFieldMetadata(data);
                    }
                    var referenceRoute = getReferenceFieldRoute(field, data);
                    if (referenceRoute) {
                        data.reference = referenceRoute;
                    }
                }
                if (data.displayValue.includes("\n")) {
                    data.hasNewLine = true;
                }
                return buildFieldMetadata(data);
            }
        };

        const processSummaryFields = (fieldRows) => {
            return fieldRows.map(field => processField(field)).filter(x => x);
        };

        const processDetailFields = (fieldRows) => {
            return fieldRows.map(row => {
                const rowMetadata = row.map(field => processField(field)).filter(x => x);
                return rowMetadata.length > 0 ? rowMetadata : null;
            }).filter(x => x);
        };

        const taskSummaryFields = processSummaryFields(fieldsMetadataForCurrentPolicyType.summaryFields);
        const taskDetailFields = processDetailFields(fieldsMetadataForCurrentPolicyType.detailsFields);

        const taskState = rawData.state.value;
        let isTaskClosed = taskState == DM_TASK_STATE.CLOSED_COMPLETE ||
        taskState == DM_TASK_STATE.CLOSED_INCOMPLETE || 
        taskState == DM_TASK_STATE.CLOSED_SKIPPED || 
        taskState == DM_TASK_STATE.CLOSED_CANCELLED;

        api.setState('taskType', taskType);
        api.setState('isTaskClosed', isTaskClosed);
        api.setState('taskSummaryFields', taskSummaryFields);
        api.setState('taskDetailsFields', taskDetailFields);
    }
}
