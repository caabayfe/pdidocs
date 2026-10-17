const apiModules = require('@devsnc/uibtk-api');

(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    const adaptiveMacroponentHandler = new AdaptiveMacroponentVariant();
    apiHelper.execute(function() {
        const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN);
        const includeRelatedRecords = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.INCLUDE_RELATED_RECORDS);
        const deviceMode = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.DEVICE_MODE) ?? BuilderToolkitConstants.ADAPTIVE_VARIANT_MODES.DESKTOP;
        const {
            macroponent: _macroponent,
            clientScripts = [],
            addOnEventMappings = [],
            events = [],
            dismissedRuleViolations,
            testValues = BuilderToolkitConstants.SCREEN_TEST_VALUE_MACROPONENT_CONFIG_DEFAULT_VALUE,
            adaptiveVariants = {}
        } = request.body.data;

        let macroponent = _macroponent;
        let variantMacroponents = null;
		
        if (macroponent && adaptiveMacroponentHandler.isValidDeviceType(deviceMode)) {
            // need to split to base and variants and update
            ({
                baseMacroponent: macroponent,
                variantMacroponents
            } = adaptiveMacroponentHandler.reconstructMacroponents(_macroponent, adaptiveVariants, deviceMode));
        }


        if (macroponent && macroponent?.formFactors) {
            macroponent.formFactors = new FormFactorHelper().stripGlobalFormFactors(macroponent.formFactors);
        }

        if (includeRelatedRecords === true) {
            const eventHandler = new UXEvent();
            // We have to update, insert, or delete as needed
            // Then we have to update our macroponent's dispatched/handled events
            // Sometimes an event will already exist with the same namespace, so we just switch our MCP to that ID instead
            const {
                updatedDispatchedEvents = '',
                    updatedHandledEvents = '',
                    eventOperationResults = []
            } = eventHandler.upsertAndDeleteRecords(events, macroponent);

            if (updatedDispatchedEvents !== '' || updatedHandledEvents !== '') {
                macroponent.dispatchedEvents = updatedDispatchedEvents;
                macroponent.handledEvents = updatedHandledEvents;
            }
            const rd = new apiModules.RuleDismiss();
            apiHelper.getResponseFromMutliOperation({
                macroponent: macroponent ? new Macroponent().updateRecord(macroponent) : true,
                adaptiveVariants: variantMacroponents ? adaptiveMacroponentHandler.updateVariants(variantMacroponents) : true,
                clientScripts: clientScripts ? new ClientScript().processRecordsByDatabaseOperation(clientScripts) : true,
                addOnEventMappings: addOnEventMappings ? new UXAddOnEventMapping([], noDomain).processRecordsByDatabaseOperation(addOnEventMappings) : true,
                events: eventOperationResults,
                testValues: macroponent ? new ScreenTestValue().updateRecord({
                    ...testValues,
                    macroponent: macroponent.sysId
                }) : true,
                dismissedRuleViolations: dismissedRuleViolations ? new apiModules.RuleDismiss().patchDismissTarget(dismissedRuleViolations.target_id, dismissedRuleViolations.table_name, JSON.stringify(dismissedRuleViolations.dismiss_targets)) : true
            });
        } else {
            apiHelper.getResponseFromMutliOperation({
                macroponent: macroponent ? new Macroponent().updateRecord(macroponent) : true,
                adaptiveVariants: variantMacroponents ? adaptiveMacroponentHandler.updateVariants(variantMacroponents) : true,
            });
        }
    });

})(request, response);
