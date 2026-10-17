/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.data == null) {
        api.setState("hermesStatusMessage","");
        return;
    }
    //bootstrap setup text
    api.state.hermesBootstrap.producer = api.data.hermesstatus.output.bootstraps.producer;
    api.state.hermesBootstrap.consumer1 = api.data.hermesstatus.output.bootstraps.consumer1;
    api.state.hermesBootstrap.consumer2 = api.data.hermesstatus.output.bootstraps.consumer2;
    
    //Process health statuses
    var hermesStatus = api.data.hermesstatus.output.health;
    var portsHealth = api.data.hermesstatus.output.portsHealth;    
    var health = "GREY";

    api.setState("hermesStatusMessage", "");
    if (hermesStatus && portsHealth) {
        if (hermesStatus.health == "RED" &&
            portsHealth.health == "RED")
            health = "RED";
        else if (hermesStatus.health == "GREEN" &&
            portsHealth.health == "GREEN" ) {
                health = "GREEN";
                api.state.hermes.collapsed.setup = false;
            }
        else if (hermesStatus.health == "GREEN" &&
            portsHealth.health == "GRAY" ) {
                health = "GREEN"; //other tests pass and external ports are not configured
            }
        else
            health = "YELLOW";
    }

    //update header Icons
    switch (health) {
        case "RED":
            api.state.hermesHideIcons.RED = false;
            api.state.hermesHideIcons.GREEN = true;
            api.state.hermesHideIcons.GREY = true;
            api.state.hermesHideIcons.YELLOW = true;
            api.state.hermes.isValid = false;
        break;
        case "GREEN":
            api.state.hermesHideIcons.RED = true;
            api.state.hermesHideIcons.GREEN = false;
            api.state.hermesHideIcons.GREY = true;
            api.state.hermesHideIcons.YELLOW = true;
            api.state.hermes.isValid = true;
        break;
        case "YELLOW":
            api.state.hermesHideIcons.RED = true;
            api.state.hermesHideIcons.GREEN = true;
            api.state.hermesHideIcons.GREY = true;
            api.state.hermesHideIcons.YELLOW = false;
            api.state.hermes.isValid = false;
        break;
        case "GREY":
        default:
            api.state.hermesHideIcons.RED = true;
            api.state.hermesHideIcons.GREEN = true;
            api.state.hermesHideIcons.GREY = false;
            api.state.hermesHideIcons.YELLOW = true;
            api.state.hermes.isValid = false;
        break;
    }

    //plugin status
    if (hermesStatus && hermesStatus.warnings.length != 0) {
        var warningText = hermesStatus.warnings.join(" | ");
        api.setState("hermesStatusMessage", warningText);
        //connectivity test should be disabled if hermes config is not functional
        api.state.hermes.disableRunTest = true;
        api.state.hermes.disablePortTest = true;
    } else {
        api.state.hermes.disableRunTest = false;
    }

    //external port tests
    if (portsHealth) {
        var portWarningText = portsHealth.warnings[0];
        var portsLevel = "low";
        switch (portsHealth.health) {
            case 'GRAY':
                api.state.hermes.collapsed.bootstrap = false;
                api.state.hermesPortTestResults.hideAlert = false;
                api.state.hermes.disablePortTest = true;
                api.state.hermesPortTestResults.warning.message = portWarningText;
            break;
            case "RED":
            case "YELLOW":
                portsLevel = "high";
                api.state.hermes.collapsed.bootstrap = false;
                api.state.hermesPortTestResults.hideAlert = false;
            break;
            case "GREEN":
                portsLevel = "positive";
                api.state.hermesPortTestResults.hideAlert = false;
            break;
            default:
                api.state.hermesPortTestResults.hideAlert = true;
            break;
        }
        api.state.hermesPortTestResults.warning.level = portsLevel;
        api.state.hermesPortTestResults.warning.message = portWarningText;
    }
}
