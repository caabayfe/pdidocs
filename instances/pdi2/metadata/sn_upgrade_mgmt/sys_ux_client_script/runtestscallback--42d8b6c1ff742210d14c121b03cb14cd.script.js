/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var status = api.data.run_selected_test_suites.output.status;
    
    var atfInstalled = api.data.run_selected_test_suites.output.atfInstalled;
    var atfEnabled = api.data.run_selected_test_suites.output.atfEnabled;
    var cloudUserDefined = api.data.run_selected_test_suites.output.cloudUserDefined;

    api.setState("selectedRecords", []);
    api.setState("exceptedRecords", []);
    api.setState("refreshTimeStamp", new Date().getMilliseconds());
    api.setState("clearListSelection", false);
    
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
        api.setState('completeAlertHidden', true);
        api.setState('progressAlertHidden', true);
        api.setState('completeDisabled', false);
        api.setState('skipDisabled', false);
    } else {
        api.setState('errorAlertHidden', true);
        api.setState('completeAlertHidden', true);
        api.setState('progressAlertHidden', true);
        api.setState('completeDisabled', false);
        api.setState('skipDisabled', false);
    }
    api.setState('sessionIdTemp', '');
    api.setState('sessionIdTemp', api.state.sessionId);
    api.setState('refreshButton', true);
}
