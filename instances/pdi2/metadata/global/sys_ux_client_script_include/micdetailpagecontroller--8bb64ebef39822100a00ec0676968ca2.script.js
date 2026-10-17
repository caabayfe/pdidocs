function include({
    imports
}, api, helpers, props) {
    const {
        DATA_BROKER_ACTION,
        LIST_NAME,
        GET_LABELS_AND_VALUES,
        DISABLED
    } = props;
    var micClient = imports["global.MICClient"](api, helpers);

    const EVENT_HANDLERS = {
        MACROPONENT_READY: () => onPageReady(DATA_BROKER_ACTION),
        MACROPONENT_PROPERTY_CHANGED: (event) => onPageUpdate(event, DATA_BROKER_ACTION),
        back_button: () => navigateToList(LIST_NAME),
        machine_identity_data_broker: (event) => updateDetails(event.payload.data.output.response),
        mi_link: () => micClient.navigateToUserRecord(api.state.machineIdentityLink),
        EXECUTE_DATA_BROKER: executeDataBroker
    };

    function addHandler(key, value) {
        EVENT_HANDLERS[key] = value;
    }

    function checkFeatureState() {
        if (!micClient.isApplicationEnabled() || DISABLED) {
            micClient.redirectToHomePage();
            return false;
        }
        return true;
    }

    function callDataBroker(action) {
        clearDetails();
        EVENT_HANDLERS["EXECUTE_DATA_BROKER"](action);
    }

    function onPageReady(action) {
        if(checkFeatureState())
            callDataBroker(action);
    }

    function onPageUpdate(event, action) {
        if (event.payload.name == 'machineIdentity')
            callDataBroker(action);
    }

    function clearDetails() {
        api.setState("machineIdentityName", );
        api.setState("machineIdentityLink", );
        api.setState("labelValueStack", []);
    }

    function updateDetails(response) {
        var [labels, values, user] = GET_LABELS_AND_VALUES(response);
        Promise.all(labels).then(translatedLabels => {
            const labelValueStack = [];
            translatedLabels.forEach((label, index) => {
                labelValueStack.push({
                    label: label,
                    value: {
                        type: "string",
                        value: values[index]
                    }
                });
            });
            api.setState("labelValueStack", labelValueStack);
        });
        api.setState("machineIdentityName", user.userDisplayName);
        api.setState("machineIdentityLink", user.userSysId);
    }

    function executeDataBroker(action) {
        micClient.newMIDataBroker('machine_identity_data_broker').exec(action, {
            machineIdentity: api.context.props.machineIdentity
        });
    }

    function navigateToList(listName) {
        helpers.navigate.to(listName, {
            viewType: "list"
        });
    }

    function handle(event) {
        var fn = EVENT_HANDLERS[event.name] ? EVENT_HANDLERS[event.name] : EVENT_HANDLERS[event.elementId];
        if (fn)
            fn(event);
    }

    return {
        handle,
        addHandler,
        updateDetails
    };
}
