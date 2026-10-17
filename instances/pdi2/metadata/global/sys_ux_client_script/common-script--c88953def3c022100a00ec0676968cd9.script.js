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
    const micClient = imports["global.MICClient"](api, helpers);

    function onGetAuthMethodSuccess() {
        updateListConfig(api.data.get_authentication_method.results[0].value.value);
    }

    function updateListConfig(query) {
        let filter = (query ? `auth=${query}` : "") + "^ORDERBYDESClast_used";
        api.setState("listConfig", ctx => ({
            ...ctx.currentValue,
            table: "sys_mi_request",
            filter: filter
        }));
    }

    function pageReadyHandler() {
        if (!micClient.isApplicationEnabled()) {
            return micClient.redirectToHomePage();
        }
        checkAlert();
        translateListHeaderTitle();
        getAuthMethod();
    }

    function getAuthMethod() {
        api.setState('listVisible', false);
        if (api.context.props.query == 'all') {
            updateListConfig();
        } else {
            api.data.get_authentication_method.refresh();
        }
    }

    function onPropertyChange() {
        if (event.payload.name == 'query')
            getAuthMethod();
    }

    function translateListHeaderTitle() {
        helpers.translate("Unique API calls").then(translatedText => api.setState('listHeaderTitle', translatedText));
    }

    function onCellLinkClicked() {
        api.setState('userId', event.payload.cell.value);
        api.data.get_user_sys_id.refresh();
    }

    function checkAlert() {
        api.data.machine_identity_data_broker.execute({
            action: "isRateLimitingDashboardAnnouncementVisible"
        });
    }
    
    function onAlertDismiss() {
        api.data.machine_identity_data_broker.execute({
            action: "updateRateLimitingDashboardAnnouncementVisibility"
        });
        _showAlert(false);
    }
    
    function _showAlert(flag) {
        var alertProps = {...api.state.alertProps};
        if(flag) {
            helpers.translate(alertProps.message.value, "/now/platform-analytics-workspace/dashboards/params/edit/false/sys-id/99dd82d2ff222210469fffffffffff4c").then(translatedText => {
                /* While testing translation using glide.ui.i18n_test = true, html is not rendered due to MSG: prefix.
                So doing in this way. Anyway we don't want <div> to be translated.*/
                alertProps.message.value = "<div>" + translatedText + "</div>";
                alertProps.visible = true;    
                api.setState("alertProps", alertProps);
            });
        } else {
            alertProps.visible = false;
            api.setState("alertProps", alertProps);
        }
    }
    function onMachineIdentityDataBrokerResponse(payload) {
        if(payload.data.output.action == "isRateLimitingDashboardAnnouncementVisible") {
            _showAlert(payload.data.output.response == "true");
        }
    }

    const handlers = ({
        MACROPONENT_READY: pageReadyHandler,
        MACROPONENT_PROPERTY_CHANGED: onPropertyChange,
        get_authentication_method: onGetAuthMethodSuccess,
        "NOW_LIST#CELL_LINK_CLICKED": onCellLinkClicked,
        "get_user_sys_id": () => micClient.navigateToUserRecord(api.data.get_user_sys_id.results[0].sys_id.value),
        "NOW_ALERT#ACTION_CLICKED": onAlertDismiss,
        "machine_identity_data_broker": (event) => onMachineIdentityDataBrokerResponse(event.payload)
    });

    var fn = handlers[event.name] ? handlers[event.name] : handlers[event.elementId];
    if (fn)
        fn(event);
}
