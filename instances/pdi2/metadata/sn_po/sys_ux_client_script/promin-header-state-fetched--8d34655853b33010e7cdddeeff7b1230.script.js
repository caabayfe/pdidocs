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
    const pageTitle = await helpers.translate(model.modelDefinition.name);
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

    secondaryValues.push({
        fieldLabel: await helpers.translate('Total records in model'),
        displayValue: formatNumber(totalRecords)
    });

    const recordHeaderData = {
        "primary": await helpers.translate(model.modelDefinition.name),
        "secondary": secondaryValues,
        "raw": headerInfo
    };
    api.setState('header_data', recordHeaderData);
    api.setState('model_definition_id', model.modelDefinition.id);

    const {
        permissions,
        version
    } = model;

    if (version.isObsolete) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: [{
                id: 'previous-model-info-msg',
                status: 'warning',
                icon: 'info-circle-outline',
                content: await helpers.translate("This model was generated using a previous version of ServiceNow, some features might not be available. Generate the model again to enable all the features."),
                action: {
                    type: 'dismiss'
                }
            }]
        });
    }

    const compareModeOn = api.state.compare_mode_on;
    const linkedModelId = api.context.props.linkedModelId;

    const headerActions = api.state.header_actions || [];
    if (!linkedModelId && permissions.canShare && !compareModeOn) {
        api.setState('share_disabled', false);
    }
    if (!headerActions.some(ac => ac.id === 'edit-versions'))
        headerActions.push({
            id: 'edit-versions',
            label: await helpers.translate('Edit Versions'),
        });
    api.setState('header_actions', headerActions);
}
