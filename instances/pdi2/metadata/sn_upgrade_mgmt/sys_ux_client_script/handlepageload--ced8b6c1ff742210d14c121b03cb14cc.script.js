/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var status = api.data.run_test_suites.output.status;
    var testSuites = api.data.run_test_suites.output.testSuites;

    var atfInstalled = api.data.get_post_testing_status.output.atfInstalled;
    var atfEnabled = api.data.get_post_testing_status.output.atfEnabled;
    var cloudUserDefined = api.data.get_post_testing_status.output.cloudUserDefined;

    if(!atfInstalled){
        api.setState('atfInstalled', atfInstalled);
        return;
    }

    if(!atfEnabled){
        api.setState('atfEnabled', atfEnabled);
        api.setState('atfInstalled', atfInstalled);
        return;
    }

    if(!cloudUserDefined){
        api.setState('cloudUserDefined', api.data.get_post_testing_status.output.cloudUserDefined);
        api.setState('atfEnabled', atfEnabled);
        api.setState('atfInstalled', atfInstalled);
        return;
    }

    api.setState('cloudUserDefined', api.data.get_post_testing_status.output.cloudUserDefined);
    api.setState('atfEnabled', atfEnabled);
    api.setState('atfInstalled', atfInstalled);

    console.log("Test Suite Length", testSuites.length);
    if(status === 'complete'){
        api.setState('completeAlertHidden', true);
        if(testSuites.length !== 0){
            api.setState('completeAlertHidden', false);
            api.setState('progressAlertHidden', true);
            api.setState('errorAlertHidden', true);
        }
        api.setState('completeDisabled', false);
        api.setState('skipDisabled', false);
    }else if(status == "progress"){
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
