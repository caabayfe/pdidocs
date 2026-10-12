/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const instanceDetails = api.data?.data_cert_get_certification_instance_details?.output;
    const {
        instanceNumber,
        instanceState,
        dueDate,
        startTime,
        totalTaskCount,
        openTaskCount,
        completedTaskCount,
        unassignedTaskCount,
        recordCountCount,
        percentComplete
    } = instanceDetails;
    const {
        getHighlightedValue
    } = imports["sn_cmdb_ws.DataManagerCertificationDashboardUtil"](...arguments);
    const instanceHighLightedValue = getHighlightedValue(instanceState);
    const executionNumberLabel = await helpers.translate('Policy execution number');
    const stateLabel = await helpers.translate('State');
    const startDateLabel = await helpers.translate('Start date');
    const dueDateLabel = await helpers.translate('sn_cmdb_ws.duedate.sentenceCase');
    const totalRecordsLabel = await helpers.translate('Total records');
    const completeRateLabel = await helpers.translate('Completion rate');
    const totalTasksLabel = await helpers.translate('Total tasks');
    const completeLabel = await helpers.translate('Complete');
    const openLabel = await helpers.translate('Open');
    const unassignedLabel = await helpers.translate('Unassigned');
    const {
        value,
        color,
        showIcon
    } = instanceHighLightedValue;

    const headerLabelValues = [{
            "label": executionNumberLabel,
            "value": {
                "type": "string",
                "value": instanceNumber
            }
        },
        {
            "label": stateLabel,
            "value": {
                "type": "highlighted-value",
                "label": value,
                "color": color,
                "showIcon": showIcon
            }
        },
        {
            "label": startDateLabel,
            "value": {
                "type": "string",
                "value": startTime
            }
        },
        {
            "label": dueDateLabel,
            "value": {
                "type": "string",
                "value": dueDate
            }
        },
        {
            "label": totalRecordsLabel,
            "value": {
                "type": "string",
                "value": recordCountCount
            }
        },
        {
            "label": completeRateLabel,
            "value": {
                "type": "string",
                "value": percentComplete+'%'
            }
        },
        {
            "label": totalTasksLabel,
            "value": {
                "type": "string",
                "value": totalTaskCount
            }
        },
        {
            "label": completeLabel,
            "value": {
                "type": "string",
                "value": completedTaskCount
            }
        },
        {
            "label": openLabel,
            "value": {
                "type": "string",
                "value": openTaskCount
            }
        },
        {
            "label": unassignedLabel,
            "value": {
                "type": "string",
                "value": unassignedTaskCount
            }
        }
    ];

    api.setState('headerLabelValues', headerLabelValues);

}
