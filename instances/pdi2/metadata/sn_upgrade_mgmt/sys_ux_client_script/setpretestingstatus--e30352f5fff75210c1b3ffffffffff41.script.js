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
    const {convertDateFormat} = imports['sn_upgrade_mgmt.UpgradeManagementUtils']();
    var res = api.data.Get_PreTesting_Status.output;
    var boqId = res.boqId;
    var boqState = res.state;
    var boqProgress = res.progress;
    var autoGen = res.isAutoGenerateActive;
    var created = convertDateFormat(res.created);
    var cloudUserDefined = res.cloudUserDefined;
    var atfEnabled = res.atfEnabled;
    var atfInstalled = res.atfInstalled;
    var sessionType = res.sessionType;

    api.setState('isATFInstalled', atfInstalled);
    api.setState('isMoveVisible', !atfInstalled);
    api.setState('isGenerateTestDisabled', !atfInstalled);
    
    api.setState('atfEnabled', true);
    api.setState('cloudUserDefined', true);

    api.setState('boqId', boqId || '');
    api.setState('boqState', boqState || '');
    api.setState('isAutoGenerateActive', autoGen);
    api.setState('created', created);

    if(sessionType === 'bulk_app_update'){
        api.setState('sessionBulkUpdate', true);
    } else {
        api.setState('sessionBulkUpdate', false);
    }

    if(atfInstalled){
        if(!atfEnabled){
            api.setState('atfEnabled', false);
            console.log("In if Var ATFEnabled: ", api.state.atfEnabled);
            api.setState('isGenerateTestDisabled', true);
            return;
        }

        if(!cloudUserDefined){
            api.setState('cloudUserDefined', false);
            api.setState('isGenerateTestDisabled', true);
            return;
        }
        
    }

    if (!boqId && !autoGen) {
        // Case 1: Where Test Generation not done & AutoGen is false.
        // console.log('CASE 1');
        api.setState('showTg', false);
        api.setState('hideTg', true);
    } else if (boqId && !autoGen) {
        // Case 2: Where Test Generation started & AutoGen is false.
        // console.log('CASE 2');
        api.setState('showTg', true);
        api.setState('hideTg', false);
        if (boqState === "completed") {
            //green and disable cancel
            api.setState('isTgInProgress', true);
            api.setState('isTgCompleted', false);
            api.setState('isCancelDisabled', true);
            api.setState('isMarkCompleteDisabled', false);
            api.setState('isSkipDisabled', false);
        } else if(boqState === "failed"){
            //red
            api.setState('showTg', false);
            api.setState('hideTg', true);
            api.setState('isTgInProgress', true);
            api.setState('isTgCompleted', true);
            api.setState('isTgFailed', false);
            api.setState('isCancelDisabled', true);
            api.setState('isMarkCompleteDisabled', false);
            api.setState('isSkipDisabled', false);
        } else {
            //yellow
            api.setState('isTgInProgress', false);
            api.setState('isTgCompleted', true);
            api.setState('isCancelDisabled', false);
            api.setState('isMarkCompleteDisabled', true);
            api.setState('isSkipDisabled', true);
        }
    } else if (!boqId && autoGen) {
        // console.log('CASE 3');
        // Case 3: Where Test Generation not done & AutoGen is true 
        // Start test-generation only when current step "IN-PROGRESS"
        const activityState = api.data.playbook_activity_ui.playbookCardProperties.activityState.value;
        if(activityState === "IN_PROGRESS"){
            api.setState('startSessionId', '');
            api.setState('startSessionId', api.state.sessionId);
        }
    } else if (boqId && autoGen) {
        // Case 2: Where Test Generation started & AutoGen is true.
        // console.log('CASE 4');
        api.setState('showTg', true);
        api.setState('hideTg', false);
        if (boqState === "completed") {
            //green and disable cancel
            api.setState('isTgInProgress', true);
            api.setState('isTgCompleted', false);
            api.setState('isCancelDisabled', true);
            api.setState('isMarkCompleteDisabled', false);
            api.setState('isSkipDisabled', false);
        } else if(boqState === "failed"){
            //red
            api.setState('showTg', false);
            api.setState('hideTg', true);
            api.setState('isTgInProgress', true);
            api.setState('isTgCompleted', true);
            api.setState('isTgFailed', false);
            api.setState('isCancelDisabled', true);
            api.setState('isMarkCompleteDisabled', false);
            api.setState('isSkipDisabled', false);
        } else {
            //yellow
            api.setState('isTgInProgress', false);
            api.setState('isTgCompleted', true);
            api.setState('isCancelDisabled', false);
            api.setState('isMarkCompleteDisabled', true);
            api.setState('isSkipDisabled', true);
        }
    }
}
