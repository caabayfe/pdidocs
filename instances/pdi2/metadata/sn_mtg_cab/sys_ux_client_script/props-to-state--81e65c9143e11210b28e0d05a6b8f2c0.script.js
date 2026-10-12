/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({ api, event, helpers, imports }) {
    const taskData = api?.context?.props?.agendaItemRecordData || api?.context?.props?.currentAgendaItem;
    const taskRecordData = taskData?.record;
    if (!taskRecordData)
        return;

    const info = {};

    info.shortDesc = taskRecordData?.short_description?.display_value;

    const taskRelatedRecordData = taskData?.relatedRecords;

    // Set label stacked values
    const stackedValues = [];

    const record = {};
    record.label = await helpers.translate('Record');
    record.value = {
        type: 'text-link',
        label: taskData.display_value,
        href: 'javascript:void(0)',
        sysId: taskData.value,
        id: 'CAB_MEETING#OPEN_TASK_RECORD',
        table: taskRecordData.sys_class_name.value
    };

    const affectedCis = {};
    affectedCis.label = await helpers.translate('Affected CIs');
    affectedCis.value = {
        type: 'string',
        value: taskRelatedRecordData ? taskRelatedRecordData.affectedCiCount : 0,
    };

    const risk = {};
    risk.label = await helpers.translate('Risk');
    risk.value = {};
    if (taskRecordData?.risk?.display_value || (taskRecordData?.risk?.highlightedValueConfig?.show_icon?.value && taskRecordData?.risk?.highlightedValueConfig?.icon?.value)) {
        risk.value = {
            type: 'highlighted-value',
            label: taskRecordData?.risk?.display_value,
            color: taskRecordData?.risk?.highlightedValueConfig?.color?.value,
            variant: taskRecordData?.risk?.highlightedValueConfig?.variant?.value,
            showIcon: taskRecordData?.risk?.highlightedValueConfig?.show_icon?.value,
            icon: taskRecordData?.risk?.highlightedValueConfig?.icon?.value
        };
    }

    const state = {};
    state.label = await helpers.translate('State');
    state.value = {
        type: 'string',
        value: taskRecordData?.state?.display_value
    };

    const pendingApprovals = {};
    pendingApprovals.label = await helpers.translate('Pending approvals');
    pendingApprovals.value = {
        type: 'string',
        value: taskRelatedRecordData ? taskRelatedRecordData.requestedApprovalsCount : 0,
    };

    const assignmentGroup = {};
    assignmentGroup.label = await helpers.translate('Assignment group');
    assignmentGroup.value = {
        type: 'string',
        value: taskRecordData?.assignment_group?.display_value
    };

    const assignedTo = {};
    assignedTo.label = await helpers.translate('Assigned to');
    assignedTo.value = {
        type: 'string',
        value: taskRecordData?.assigned_to?.display_value
    };

    const startDate = {};
    startDate.label = await helpers.translate('Planned start');
    startDate.value = {
        type: 'string',
        value: taskRecordData?.start_date?.display_value
    };

    const endDate = {};
    endDate.label = await helpers.translate('Planned end');
    endDate.value = {
        type: 'string',
        value: taskRecordData?.end_date?.display_value
    };

    stackedValues.push(record);
    stackedValues.push(affectedCis);
    stackedValues.push(risk);
    stackedValues.push(state);
    stackedValues.push(pendingApprovals);
    stackedValues.push(assignmentGroup);
    stackedValues.push(assignedTo);
    stackedValues.push(startDate);
    stackedValues.push(endDate);
    info.stackedValues = stackedValues;

    // Set the Description stacked value
    const stackedDesc = [];
    const description = {};
    description.label = await helpers.translate('Description');
    description.value = {
        type: 'string',
        value: taskRecordData?.description?.display_value
    };
    stackedDesc.push(description);
    info.stackedDesc = stackedDesc;

    api.setState('stackedInfo', info);
}
