(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const macroponent = apiHelper.getBodyParam('macroponent', null);
        if (!macroponent) {
            apiHelper.respondUnsuccessfully(BuilderToolkitConstants.ERRORS.NO_MACROPONENT);
            return;
        }
        const copyFrom = apiHelper.getBodyParam('copyFrom', null);
        const newMacroponent = new Macroponent().copyOrCreateRecord(macroponent, copyFrom);

        typeof newMacroponent === 'string' ? apiHelper.respondSuccesfully({
            macroponent: newMacroponent
        }) : apiHelper.respondUnsuccessfully(newMacroponent.message);
    });
})(request, response);
