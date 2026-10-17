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

    const SCREEN_CHANGED_EVENT = "SCREEN_STATUS_CHANGED";
    const MACROPONENT_READY_EVENT = "MACROPONENT_READY";
    const ADD_ALERTS_EVENT = "NOW_UXF_PAGE#ADD_NOTIFICATIONS";
    const REMOVE_ALERTS_EVENT = "NOW_UXF_PAGE#REMOVE_NOTIFICATIONS";
    const translatedItems = api.state.translatedItems;

    const onPageReady = () => {
        helpers.translate("Access Insights has been enabled. Refresh your Compare page to start seeing stats.")
            .then(label => translatedItems.enabledAlert = label);

        helpers.translate("Access Insights has been disabled.")
            .then(label => translatedItems.disabledAlert = label);

        helpers.translate("Please select one or more attributes.")
            .then(label => translatedItems.peerColumnsAlert = label);

        translatedItems.insightsToggle = {};
        helpers.translate("Enabled").then(label => translatedItems.insightsToggle.enabled = label);
        helpers.translate("Disabled").then(label => translatedItems.insightsToggle.disabled = label);

        helpers.translate("The 'Company' field cannot be removed from the Peer-Level definition.")
            .then(label => translatedItems.companyMandate = label);
        
        const peerLevelColumnNames = [
            helpers.translate("Company"),
            helpers.translate("Cost center"),
            helpers.translate("Country code"),
            helpers.translate("Department"),
            helpers.translate("Location"),
            helpers.translate("Manager"),
            helpers.translate("Title")
        ];
        const supportedPeerLevelColumns = [...api.state.insightsConfiguration.supportedPeerLevelColumns];
        Promise.all(peerLevelColumnNames).then(values => values.forEach((columnLabel, i) => supportedPeerLevelColumns[i].label = columnLabel));

        api.data.insightsController.execute({
            action: 'loadInsightsConfiguration',
            payload: null
        });
    };

    const saveConfiguration = () => {
        if (api.state.insightsConfiguration.enabled &&
            api.state.insightsConfiguration.peerLevelColumns.length === 0) {
            return;
        }
        api.emit(REMOVE_ALERTS_EVENT, {
            items: [getInsightsEnabledAlert(), getInsightsDisabledAlert()]
        });
        api.data.insightsController.execute({
            action: 'saveInsightsConfiguration',
            payload: {
                enabled: api.state.insightsConfiguration.enabled,
                peerLevelColumns: api.state.insightsConfiguration.peerLevelColumns.map(column => column.id).join(',')
            }
        });

    };

    const loadConfiguration = (insightsConfiguration) => {
        let insightsEnabled = insightsConfiguration.enabled;
        let peerColumns = insightsConfiguration.peerLevelColumns.split(',');
        let statusLabel = insightsEnabled ? translatedItems.insightsToggle.enabled :
            translatedItems.insightsToggle.disabled;

        peerColumns = api.state.insightsConfiguration.supportedPeerLevelColumns
            .filter(column => peerColumns.includes(column.id))

        api.setState('previousConfiguration', {
            enabled: insightsEnabled,
            peerLevelColumns: peerColumns
        });

        api.setState("insightsConfiguration", ({
            currentValue
        }) => {
            return {
                ...currentValue,
                enabled: insightsEnabled,
                statusLabel: statusLabel,
                statusColor: insightsEnabled ? 'positive' : 'critical',
                loaded: true,
                peerLevelColumns: peerColumns
            };
        });
    };

    const toggleInsights = () => {
        let status = event.payload.value;
        updateScreenStatus('enabled', status);
        let statusLabel = status ? translatedItems.insightsToggle.enabled :
            translatedItems.insightsToggle.disabled;

        api.setState("insightsConfiguration", ({
            currentValue
        }) => {
            return {
                ...currentValue,
                enabled: status,
                statusLabel: statusLabel,
                statusColor: status ? 'positive' : 'critical'
            };
        });
    };

    const peerLevelColumnsChanged = () => {
        let value = event.payload.value;

        // To restrict removing company
        if (!value.some(a => a.id == 'company')) {
            showCompanyMandateAlert();
            return;
        }

        updateScreenStatus('peerLevelColumns', value);
        api.setState("insightsConfiguration", ({
            currentValue
        }) => {
            return {
                ...currentValue,
                peerLevelColumns: value
            };
        });
        api.setState('peerColumnsAlert', value.length > 0 ? null : [{
            "status": "critical",
            "icon": "circle-exclamation-outline",
            "content": translatedItems.peerColumnsAlert
        }]);
    };

    const getInsightsEnabledAlert = () => {
        return {
            id: "insights_enabled_alert",
            status: "positive",
            icon: "circle-info-outline",
            header: translatedItems.insightsToggle.enabled,
            content: translatedItems.enabledAlert,
            action: {
                type: "dismiss"
            }
        };
    };

    const getInsightsDisabledAlert = () => {
        return {
            id: "insights_disabled_alert",
            status: "warning",
            icon: "circle-info-outline",
            header: translatedItems.insightsToggle.disabled,
            content: translatedItems.disabledAlert,
            action: {
                type: "dismiss"
            }
        };
    };

    const showCompanyMandateAlert = () => {
        api.emit(ADD_ALERTS_EVENT, {
            items: [{
                id: "company_mandate_alert",
                status: "warning",
                icon: "circle-info-outline",
                content: translatedItems.companyMandate,
                action: {
                    type: "dismiss"
                }
            }]
        });
    };

    const onSaveConfigSuccess = () => {
        let alertItem = api.state.insightsConfiguration.enabled ? getInsightsEnabledAlert() :
            getInsightsDisabledAlert();
        api.emit(ADD_ALERTS_EVENT, {
            items: [alertItem]
        });
        let current = api.state.insightsConfiguration;
        api.setState('previousConfiguration', {
            enabled: current.enabled,
            peerLevelColumns: [...current.peerLevelColumns]
        });
        updateComponents(false);
    };

    const onInsightsControllerResponse = () => {
        const {
            action,
            result
        } = event.payload.data.output;
        switch (action) {
            case 'loadInsightsConfiguration':
                loadConfiguration(result);
                break;
            case 'saveInsightsConfiguration':
                onSaveConfigSuccess();
                break;
        }
    };

    function updateScreenStatus(key, value) {
        api.state.insightsConfiguration[key] = value;
        let current = api.state.insightsConfiguration;
        let previous = api.state.previousConfiguration;
        let updated = current.enabled != previous.enabled || (previous.enabled && JSON.stringify(current.peerLevelColumns) != JSON.stringify(previous.peerLevelColumns));
        updateComponents(updated);
        api.emit(REMOVE_ALERTS_EVENT, {
            items: [getInsightsEnabledAlert(), getInsightsDisabledAlert()]
        });
    };

    const updateComponents = (status) => {
        api.setState('saveButtonEnabled', status);
        api.emit(SCREEN_CHANGED_EVENT, {
            isDirty: status
        });
    };

    if (event.name === MACROPONENT_READY_EVENT) {
        onPageReady();
        return;
    }


    ({
        save_configuration_btn: saveConfiguration,
        enableInsights: toggleInsights,
        peer_level_columns_typeahead_multi: peerLevelColumnsChanged,
        insightsController: onInsightsControllerResponse
    } [event.elementId])();
}
