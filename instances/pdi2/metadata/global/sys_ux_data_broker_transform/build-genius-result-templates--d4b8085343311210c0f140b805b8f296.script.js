function transform(input) {
    if (!input.searchGraphqlData) {
        gs.error("Invalid empty value provided as input for searchGraphqlData. Check that the search executed successfully.");
        return {
            items: []
        };
    }
    if (!("geniusResults" in input.searchGraphqlData)) {
        gs.error("No geniusResults property exists on provided input to Build Genius Result Templates transform. Check that the search executed successfully.");
        return {
            items: []
        };
    }

    var evamDefinitionId = input.evamDefinitionId;
    if (!evamDefinitionId) {
        gs.error("No EVAM Definition ID provided as input to Build Genius Result Templates transform.");
        return {
            items: []
        };
    }

    var geniusResultsJson = input.searchGraphqlData.geniusResults;
    var locale = input.locale;

    var geniusResultTemplates = sn_search.ScriptableResultTemplateMapper.getGeniusResultTemplates(
        evamDefinitionId,
        JSON.stringify(geniusResultsJson),
        locale
    );
    var geniusResultTemplatesSearch = JSON.parse(geniusResultTemplates);
    var vaEvamDefinitionId = input.vaEvamDefinitionId;

    // We only want to add VA items if VA evam definition id is sent to us
    if (vaEvamDefinitionId) {
        geniusResultTemplatesSearch.forEach(function(geniusResultTemplate) {
            var templateSysId = geniusResultTemplate.propValues.model.sys_id;
            geniusResultsJson.forEach(function(gqlGR) {
                var resultSysId;
                var vaEvamItem;
                gqlGR.data.forEach(function(column) {
                    if (column.fieldName == 'sys_id')
                        resultSysId = column.value;
                    if (column.fieldName == 'vaEvamItem')
                        vaEvamItem = column.value;
                });
                if (resultSysId == templateSysId && vaEvamItem)
                    geniusResultTemplate.vaEvamItem = JSON.parse(vaEvamItem);
            });
        });
    } else {
        gs.debug("No VA EVAM Definition ID provided as input to Build Genius Result Templates transform.");
    }

    return {
        items: geniusResultTemplatesSearch
    };
}
