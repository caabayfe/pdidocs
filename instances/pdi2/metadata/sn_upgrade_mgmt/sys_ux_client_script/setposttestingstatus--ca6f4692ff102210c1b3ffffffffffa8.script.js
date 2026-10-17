/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    api.setState('stateObj', api.data.get_post_testing_status.output);
    api.setState("refreshTimeStamp", new Date().getMilliseconds());
    api.setState('refreshButton', false);
    api.setState('failureCount', api.data.get_post_testing_status.output.failure_count);
    var atfInstalled = api.data.get_post_testing_status.output.atfInstalled;
    var atfEnabled = api.data.get_post_testing_status.output.atfEnabled;
    var cloudUserDefined = api.data.get_post_testing_status.output.cloudUserDefined;

    if(atfInstalled && atfEnabled && cloudUserDefined){
        api.setState("isActionHidden", false);
    } else {
        api.setState("isActionHidden", true);
    }

    if(!atfInstalled){
        api.setState('atfInstalled', atfInstalled);
        return;
    }

    if(!atfEnabled){
        api.setState('atfInstalled', atfInstalled);
        api.setState('atfEnabled', atfEnabled);
        return;
    }

    if(!cloudUserDefined){
        api.setState('atfInstalled', atfInstalled);
        api.setState('atfEnabled', atfEnabled);
        api.setState('cloudUserDefined', api.data.get_post_testing_status.output.cloudUserDefined);
        return;
    }

    api.setState('atfInstalled', atfInstalled);
    api.setState('atfEnabled', atfEnabled);
    api.setState('cloudUserDefined', api.data.get_post_testing_status.output.cloudUserDefined);
    
    var status = api.data.get_post_testing_status.output.status;
    if (status === 'complete') {
        api.setState('completeAlertHidden', false);
        api.setState('progressAlertHidden', true);
        api.setState('errorAlertHidden', true);
        api.setState('completeDisabled', false);
        api.setState('skipDisabled', false);
    } else if (status == "progress") {
        api.setState('progressAlertHidden', false);
        api.setState('completeAlertHidden', true);
        api.setState('errorAlertHidden', true);
        api.setState('completeDisabled', true);
        api.setState('skipDisabled', true);
    } else if (status == "error") {
        api.setState('errorAlertHidden', false);
        api.setState('progressAlertHidden', true);
        api.setState('completeAlertHidden', true);
        api.setState('completeDisabled', false);
        api.setState('skipDisabled', false);
    } 
    else {
        api.setState('errorAlertHidden', true);
        api.setState('progressAlertHidden', true);
        api.setState('completeAlertHidden', true);
        api.setState('completeDisabled', false);
        api.setState('skipDisabled', false);
    }
}
