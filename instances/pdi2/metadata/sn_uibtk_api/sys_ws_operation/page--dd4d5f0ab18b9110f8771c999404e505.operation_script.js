const apiModules = require('@devsnc/uibtk-api');
(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const noDomain = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.NO_DOMAIN);
        const {
            screen,
            screenAttrs,
            macroponent,
            clientScripts = [],
            screenTestValues = {},
            addOnEventMappings = [],
            events = [],
            dismissedRuleViolations,
			testValues = BuilderToolkitConstants.SCREEN_TEST_VALUE_MACROPONENT_CONFIG_DEFAULT_VALUE
        } = request.body.data;

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

        if (macroponent && macroponent?.formFactors) {
            macroponent.formFactors = new FormFactorHelper().stripGlobalFormFactors(macroponent.formFactors);
        }

        apiHelper.getResponseFromMutliOperation({
            screen: screen ? new Screen([], noDomain).updateRecord(screen) : true,
            screenAttrs: screenAttrs ? new ScreenAttrs([], noDomain).createScreenAttrsForScreenId(screenAttrs) : true,
            macroponent: macroponent ? new Macroponent().updateRecord(macroponent) : true,
            clientScripts: clientScripts ? new ClientScript().processRecordsByDatabaseOperation(clientScripts) : true,
            screenTestValue: screenTestValues ? new ScreenTestValue().updateRecord({screen:screen?.sysId ?? screenTestValues?.screen, ...screenTestValues}) : true,
            addOnEventMappings: addOnEventMappings ? new UXAddOnEventMapping([], noDomain).processRecordsByDatabaseOperation(addOnEventMappings) : true,
            events: eventOperationResults,
			testValues: new ScreenTestValue().updateRecord({...testValues, macroponent: macroponent.sysId}),
            dismissedRuleViolations: dismissedRuleViolations ? new apiModules.RuleDismiss().patchDismissTarget(dismissedRuleViolations.target_id, dismissedRuleViolations.table_name, JSON.stringify(dismissedRuleViolations.dismiss_targets)) : true
        });
    });

})(request, response);
