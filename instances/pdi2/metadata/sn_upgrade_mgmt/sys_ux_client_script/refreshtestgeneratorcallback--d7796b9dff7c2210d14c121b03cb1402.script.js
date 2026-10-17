/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var resultObj = {};
    resultObj = JSON.parse(api.data.refresh_test_generator.output);
    var keys = Object.keys(resultObj);
    var result = {};
    for (let i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = resultObj[key];
        if(key === 'state') {
            continue;
        }
        result[key] = value;
    }
    api.setState('isMarkCompleteDisabled', true);
    api.setState('isSkipDisabled', true);

    if (resultObj.state === "completed") {
        api.setState('isTgInProgress', true);
        api.setState('isTgCompleted', false);
        api.setState('isCancelDisabled', true);
        api.setState('isMarkCompleteDisabled', false);
        api.setState('isSkipDisabled', false);

    } else if(resultObj.state === "failed"){
        api.setState('showTg', !api.state.showTg);
        api.setState('hideTg', !api.state.hideTg);
        api.setState('isTgInProgress', true);
        api.setState('isTgCompleted', true);
        api.setState('isTgFailed', false);
        api.setState('isMarkCompleteDisabled', false);
        api.setState('isSkipDisabled', false);
    }
    api.setState("timeStampForUpgradeTest", new Date().getMilliseconds());
}
