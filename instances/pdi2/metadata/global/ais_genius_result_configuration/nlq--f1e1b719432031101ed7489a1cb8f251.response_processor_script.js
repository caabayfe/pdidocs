function process(context) {
    var OE_CAPABILITY_ID = 'c061cecf7056f110f8779b1be17c7af7';

    var user = gs.getUser();
    // NLQ only supports english as of washington release
    if (user.getLanguage() != 'en') {
        return null;
    }
    var wsAccess = user.hasRole('sn_cmdb_user');
    if (!wsAccess) gs.debug('NLQ GR - User: ' + user.getFullName() + ' not authorized for CMDB workspace');

    var answer = new sn_ais.GeniusResultAnswer();
    var query = context.getOriginalSearchPhrase();
    var timeout = parseInt(this._getProperty("sn_ais_assist.u_llm_api_timeout", 120)); // Same as what's used for Q&A

    // Fields needed for the Genius Result that aren't based on the NLQ response
    var dataMap = {
        'label': 'NLQ',
        'searchProfile': context.getSearchContext()['fProfile'],
        'utterance': query
    };
    var meta = context.getSearchQueryRequestDetails();
    meta.initialDataMap = dataMap;

    var mode = 'SYNC';
    if (!gs.nil(context.getAsyncMode()) && context.getAsyncMode() != 'OFF')
        mode = 'ASYNC';

    var nlqRequest = {
        timeout: timeout,
        mode: mode,
        callbackHandler: "AISearchNLQUtils",
        executionRequests: [{
            payload: {
                query: query,
                wsAccess: wsAccess,
                meta: meta
            },
            capabilityId: OE_CAPABILITY_ID,
            returnRequest: true
        }]
    };

    var result = {};
    try {
        result = new sn_one_extend.OneExtendUtil.execute(nlqRequest);
    } catch (e) {
        gs.error("An error occurred when submitting an NLQ request to OneExtend: ", e);
    }

    if (result.capabilities && result.capabilities[OE_CAPABILITY_ID]) {
        var response = result.capabilities[OE_CAPABILITY_ID].output.response;
        if (response && response.length > 2) {
            dataMap.response = response;
            dataMap.multiTable = result.capabilities[OE_CAPABILITY_ID].output.multiTable;
            dataMap.navConfig = result.capabilities[OE_CAPABILITY_ID].output.navConfig;
            answer.addDataMap(dataMap);
            return answer;
        } else {
            return;
        }
    } else if (result.status == "success") {
        answer.setAwaitingResults(true); // Submitted in Async mode, full answer will be generated later in callback handler
        return answer;
    } else {
        gs.error("An error occurred while executing the job for NLQ Genius Results: " + result.status);
    }
}
