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
    const {
        formatNumber,
        formatDuration,
        getRootModel,
    } = imports["global.prominUtils"]();

    const headerInfo = api.data.fetch_promin_header_state_1.output.data.GlidePromin_Query;
    const model = headerInfo.scheduleModel;
    const {
        rootAggregate: {
            model: rootModel
        },
        rootEntity
    } = getRootModel(model);

    const pageTitle = model.project.name;
    const {
        totalRecords,
        accessibleRecords,
        recordsWithAudit,
    } = model.miningStats;

    api.emit('SCREEN_STATUS_CHANGED', {
        title: pageTitle
    });

    const numberUnits = {
        k: await helpers.translate('k'),
        m: await helpers.translate('m'),
        b: await helpers.translate('b')
    };

    const durationUnits = {
        s: await helpers.translate('s'),
        m: await helpers.translate('m'),
        h: await helpers.translate('h'),
        d: await helpers.translate('d')
    };

    const userPreferences = api.data.look_up_user_preferences_1.result;
    const country = userPreferences.country || 'US';
    const language = userPreferences.language || 'en';

    let secondaryValues = [{
        fieldLabel: await helpers.translate('Table'),
        displayValue: rootEntity.table.label
    }, {
        fieldLabel: await helpers.translate('PROMIN:Records'),
        displayValue: formatNumber(totalRecords, {
            units: numberUnits,
            locale: `${language}-${country}`
        })
    }, {
        fieldLabel: await helpers.translate('Routes'),
        displayValue: formatNumber(rootModel.variantCount, {
            units: numberUnits,
            locale: `${language}-${country}`
        })
    }, {
        fieldLabel: await helpers.translate('Avg Duration'),
        displayValue: formatDuration(rootModel.avgCaseDuration * 1000, {
            units: durationUnits
        })
    }];

    if (rootModel.stdDeviation >= 0)
        secondaryValues.push({
            fieldLabel: await helpers.translate('Std Deviation'),
            displayValue: formatDuration(rootModel.stdDeviation * 1000, {
                units: durationUnits
            })
        });

    if (rootModel.medianDuration >= 0)
        secondaryValues.push({
            fieldLabel: await helpers.translate('Med Duration'),
            displayValue: formatDuration(rootModel.medianDuration * 1000, {
                units: durationUnits
            })
        });

    const recordHeaderData = {
        "primary": model.project.name,
        "secondary": secondaryValues,
        "raw": headerInfo
    };

    api.setState('header_data', recordHeaderData);
    api.setState('model_definition_id', model.project.projectId);

    const {
        permissions,
        version,
        version: {
            projectDefinition
        }
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
    const {
        isSnPoAdmin,
        isSnPoPowerUser,
        isSnPoAnalyst
    } = api.data.get_user_info.output.data.snPo.GlidePromin.prominGetUserInfo.userInfo;
    
    const editVersionsDisabled = !isSnPoAdmin && !isSnPoPowerUser && !isSnPoAnalyst;
    if (permissions.canWrite && !headerActions.some(ac => ac.id === 'edit-project'))
        headerActions.push({
            id: 'edit-project',
            label: await helpers.translate('Edit Project'),
        });
    if (!headerActions.some(ac => ac.id === 'edit-versions'))
        headerActions.push({
            id: 'edit-versions',
            label: await helpers.translate('Edit Versions'),
            disabled: editVersionsDisabled ? true : false,
        });
    api.setState('header_actions', headerActions);
}
