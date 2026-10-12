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
    } = imports["global.prominUtils"]();
    const headerInfo = api.data.fetch_promin_header_state_1.output.data.GlidePromin_Query;
    const version = headerInfo.version;
    api.setState('versionLoading', false);
    const {
        rootAggregates,
        projectDefinition,
        projectDefinition: {
            projectEntities,
            permissions,
            projectId,
            restricted,
            name,
            source,
            paDashboardId,
        },
    } = version;
    const rootEntity = (projectEntities || []).find(entity => entity.parentId === null);
    if (!rootEntity) {
        return;
    }
    const rootAggregate = (rootAggregates || []).find(item => item.entityId === rootEntity.entityId)?.model;

    const {
        accessibleRecords,
        recordsWithAudit,
    } = version.miningStats;

    const notifications = [...api.state.componentNotifications];

    api.setState('model_definition_id', projectId);
    api.setState('restricted', restricted);
    api.setState('isEvaluation', (source || '').startsWith('FREEMIUM'));
    api.emit('SCREEN_STATUS_CHANGED', {
        title: name
    });
    api.setState('hideKpiDashboardTab', !Boolean(paDashboardId));

    if (version.state.value !== 'AVAILABLE') {
        api.setState('lookForNextAvailableLatestVersion', true);
        // freeze the UI with empty state message illustration. 
        return;
    }

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

    // `userPreferences` could be `undefined` in unknown cases
    const userPreferences = api.data.look_up_user_preferences_1.result;
    const country = userPreferences?.country || 'US';
    const language = userPreferences?.language || 'en';

    let secondaryValues = [{
        id: 'Table',
        label: await helpers.translate('Table'),
        value: rootEntity.table.label
    }, {
        id: 'Records',
        label: await helpers.translate('PROMIN:Records'),
        value: formatNumber(rootAggregate?.caseCount, {
            units: numberUnits,
            locale: `${language}-${country}`
        })
    }, {
        id: 'Variants',
        label: await helpers.translate('Variants'),
        value: formatNumber(rootAggregate?.variantCount, {
            units: numberUnits,
            locale: `${language}-${country}`
        })
    }, {
        id: 'Avg_Duration',
        label: await helpers.translate('Avg duration'),
        value: formatDuration(rootAggregate?.avgCaseDuration * 1000, {
            units: durationUnits
        })
    }];

    if (rootAggregate?.medianDuration >= 0)
        secondaryValues.push({
            label: await helpers.translate('Med duration'),
            value: formatDuration(rootAggregate?.medianDuration * 1000, {
                units: durationUnits
            })
        });

    if (rootAggregate?.stdDeviation >= 0)
        secondaryValues.push({
            label: await helpers.translate('Std deviation duration'),
            value: formatDuration(rootAggregate?.stdDeviation * 1000, {
                units: durationUnits
            })
        });

    const recordHeaderData = {
        "primary": projectDefinition.name,
        "secondary": secondaryValues,
        "raw": headerInfo
    };

    if (rootEntity.sourceType.value !== "PLAYBOOK_DATA") {
        api.setState('header_data', recordHeaderData);
    }

    if (version.isObsolete) {
        notifications.push({
            id: 'previous-model-info-msg',
            status: 'warning',
            icon: 'info-circle-outline',
            content: await helpers.translate("This model was generated using a previous version of ServiceNow, some features might not be available. Generate the model again to enable all the features."),
            action: {
                type: 'dismiss'
            }
        });
    }

    const compareModeOn = api.state.compare_mode_on;
    const headerActions = api.state.header_actions || [];
    if (permissions.canShare && !compareModeOn) {
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

    if(notifications.length > 0) {
        api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
            items: notifications
        });
    }

    api.data.fetch_promin_configuration_1.execute({
        table: rootEntity.table.name
    });
}
