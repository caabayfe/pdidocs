var {
    RuleFetcher
} = require('@devsnc/uibtk-api');

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(() => {
        const sysId = apiHelper.getQueryParam('sysId');
        if (!sysId) {
            apiHelper.respondUnsuccessfully('Missing required query parameter "sysId".');
        } else {
            var rf = new RuleFetcher();
            var subscribedRules = rf.getSubscribedRules({
                sysId
            });
            apiHelper.respondSuccesfully({
                subscribedRules
            });
        }
    });
})(request, response);
