/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const headerInfo = api.data.fetch_promin_header_state_1.output.data.GlidePromin_Query;
    const model = headerInfo.scheduleModel;
    const rootModel = model.rootAggregate.model;
    const pageTitle = model.modelDefinition.name;
    const {
        totalRecords,
        accessibleRecords,
        recordsWithAudit,
    } = model.miningStats;

    api.emit('SCREEN_STATUS_CHANGED', {
        title: pageTitle
    });

    const {
        formatNumber,
        formatDuration
    } = imports["global.prominUtils"]();

    let secondaryValues = [{
        fieldLabel: await helpers.translate('Table'),
        displayValue: model.table.label
    }, {
        fieldLabel: await helpers.translate('PROMIN:Records'),
        displayValue: formatNumber(rootModel.caseCount)
    }, {
        fieldLabel: await helpers.translate('Routes'),
        displayValue: formatNumber(rootModel.variantCount)
    }, {
        fieldLabel: await helpers.translate('Avg Duration'),
        displayValue: formatDuration(rootModel.avgCaseDuration * 1000)
    }];

    if (rootModel.stdDeviation >= 0)
        secondaryValues.push({
            fieldLabel: await helpers.translate('Std Deviation'),
            displayValue: formatDuration(rootModel.stdDeviation * 1000)
        });

    if (rootModel.medianDuration >= 0)
        secondaryValues.push({
            fieldLabel: await helpers.translate('Med Duration'),
            displayValue: formatDuration(rootModel.medianDuration * 1000)
        });

    if (totalRecords > accessibleRecords)
        secondaryValues.push({
            fieldLabel: await helpers.translate('Records with no access'),
            displayValue: formatNumber(totalRecords - accessibleRecords)
        });

    if (totalRecords > recordsWithAudit)
        secondaryValues.push({
            fieldLabel: await helpers.translate('Records with audit log'),
            displayValue: formatNumber(recordsWithAudit)
        });

    const recordHeaderData = {
        "primary": model.modelDefinition.name,
        "secondary": secondaryValues,
        "raw": headerInfo
    };
    api.setState('header_data', recordHeaderData);
}
