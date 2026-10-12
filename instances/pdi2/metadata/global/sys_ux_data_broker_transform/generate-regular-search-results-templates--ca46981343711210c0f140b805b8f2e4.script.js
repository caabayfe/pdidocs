function transform(input) {

    /** Returns the field value from the list of columns on a regular search result from GQL response */
    function getFieldValue(gqlSearchResult, fieldName) {
        var response = '';
        for (var i = 0; i < gqlSearchResult.columns.length; i++) {
            var col = gqlSearchResult.columns[i];
            if (col.fieldName == fieldName) {
                response = col.value;
                break;
            }
        }
        return response;
    }

    if (!input.searchGraphqlData) {
        gs.error("Invalid empty value provided as input for searchGraphqlData. Check that the search executed successfully.");
        return {
            items: []
        };
    }
    if (!("searchResults" in input.searchGraphqlData)) {
        gs.error("No searchResults property exists on provided input to Generate Regular Search Results transform. Check that the search executed successfully.");
        return {
            items: []
        };
    }
    var evamDefinitionId = input.evamDefinitionId;
    if (!evamDefinitionId) {
        gs.error("No EVAM Definition ID provided as input to Generate Regular Search Results transform");
        return {
            items: []
        };
    }
    var searchContextConfigId = input.searchContextConfigId;
    if (!searchContextConfigId) {
        gs.error("No Search Context Config ID provided as input to Generate Regular Search Results transform");
        return {
            items: []
        };
    }

    var searchResultsJson = input.searchGraphqlData.searchResults;
    var locale = input.locale;

    var searchResultTemplates = sn_search.ScriptableResultTemplateMapper.getRegularResultTemplates(
        evamDefinitionId,
        JSON.stringify(searchResultsJson),
        locale,
        searchContextConfigId
    );

    var searchResultTemplatesSearch = JSON.parse(searchResultTemplates);

    var vaEvamDefinitionId = input.vaEvamDefinitionId;
    if (vaEvamDefinitionId) {
        // We would only want to add if there is a need for handoff to VA
        searchResultTemplatesSearch.forEach(function(templateObj) {
            var sysId = templateObj.propValues.model.sys_id;
            var vaEvamItem;
            var isConversational = false;
            searchResultsJson.forEach(function(gqlSearchResult) {
                var searchResultItemId = getFieldValue(gqlSearchResult, 'sys_id');
                var isMatch = searchResultItemId == sysId;
                var searchResultConversationalParam = getFieldValue(gqlSearchResult, 'conversational');
                var vaEvamFromGqlResult = getFieldValue(gqlSearchResult, 'vaEvamItem');
                if (isMatch) {
                    vaEvamItem = vaEvamFromGqlResult;
                    isConversational = searchResultConversationalParam;
                }
            });
            if (vaEvamItem) {
                templateObj.vaEvamItem = JSON.parse(vaEvamItem);
                templateObj.propValues.model.isConversational = isConversational;
                templateObj.propValues.isConversational = isConversational;
            }
        });
    } else {
        gs.debug("No VA EVAM Definition ID provided as input to Generate Regular Search Results Templates transform.");
    }

    return {
        items: searchResultTemplatesSearch
    };
}
