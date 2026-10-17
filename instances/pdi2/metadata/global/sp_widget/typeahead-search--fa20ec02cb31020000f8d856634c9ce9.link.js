function(scope, elem) {
    var lazyLoader = $injector.get("lazyLoader");
    var SEARCH_EXECUTED_EVENT = "SN_SEARCH_COMBOBOX#SEARCH_EXECUTED";
    var UTTERANCE_CLICKED_EVENT = "SN_SEARCH_COMBOBOX#UTTERANCE_CLICKED"
    var CUSTOM_ROUTE_SEARCH_EVENT = "SN_SEARCH_COMBOBOX#CUSTOM_SEARCH_ROUTE_EXECUTED";
    var NAVIGATION_EVENT = "SN_SEARCH_COMBOBOX#NAVIGATION_EXECUTED";

    lazyLoader.putTemplates(scope.data.typeaheadTemplates);

    if (scope.c.data.aisEnabled) {
        elem.on(SEARCH_EXECUTED_EVENT, ".aisearch", function(result) {
            scope.c.aisSubmit(result.detail.payload);
        })

        elem.on(UTTERANCE_CLICKED_EVENT, ".aisearch", function(event) {
            if (scope.c.data.nowAssistEnabled) {
                scope.c.aisSubmit({
                    searchTerm: event.detail.payload.utterance
                });
            } else {
                var searchContext = event.detail.payload;
                searchContext.intention = 'search';
                var transferred_search_result = {};
                transferred_search_result.searchContext = searchContext
                window.nowAssistDynamicWindow
                    .open({
                        context: {
                            transferred_search_result: JSON.stringify(transferred_search_result)
                        },
                        forceNewConversation: true
                    });
            }
        })

        elem.on(NAVIGATION_EVENT, ".aisearch", function(result) {
            var resultPayload = result.detail.payload;
            var ga = new GlideAjax('SPSearchResultActions');
            ga.addParam('sysparm_name', 'getSuggestionResultAction');
            ga.addParam('sysparam_tableName', resultPayload.actionPayload.table);
            ga.addParam('sysparam_sysId', resultPayload.actionPayload.sysId);
            ga.addParam('sysparam_portalId', scope.c.data.portalId);
            ga.getXML(callback);

            function callback(response) {
                var answer = response.responseXML.getElementsByTagName("answer");
                resultPayload["actionDispatch"] = "NAVIGATION";
                resultPayload["actionType"] = "uxf_client_action";
                resultPayload["assignmentId"] = answer[0].getAttribute('actionId');
                const actionUrl = answer[0].getAttribute('actionUrl');
                if (actionUrl)
                    resultPayload.actionPayload["url"] = actionUrl;

                if (!resultPayload.actionPayload["url"] && resultPayload.actionPayload["recordUrl"])
                    resultPayload.actionPayload["url"] = resultPayload.actionPayload["recordUrl"];

                scope.c.navigate(scope.c.data, resultPayload.actionPayload, resultPayload);
            }
        });
        if (scope.c.data.nowAssistEnabled) {
            elem.one('focus', ".aisearch", function() {
                scope.c.ensureNowAssistSelfServiceIsLoaded();
            });
        }
    }
}
