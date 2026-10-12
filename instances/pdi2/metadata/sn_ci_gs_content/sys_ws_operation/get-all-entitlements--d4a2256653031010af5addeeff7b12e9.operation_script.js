(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var guidedSetupEntitlementsHelper = new sn_ci_gs_content.GuidedSetupEntitlementsHelper();
        return guidedSetupEntitlementsHelper.fetchEntitlements();
    } catch (e) {
        gs.error('Error occured while fetching entitlements' + e);
    }
})(request, response);
