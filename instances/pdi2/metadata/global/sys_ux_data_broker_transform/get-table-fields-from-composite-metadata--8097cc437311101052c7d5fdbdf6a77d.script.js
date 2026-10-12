function transform(input) {
    var evamId = input.searchEvamConfigId;
    if (!evamId || evamId.trim() == "") {
        gs.error('Transform script "Get Table Fields from Composite Metadata" called with invalid input for searchEvamConfigId. Provided value: ' + evamId);
        return "";
    }
    var tableToFieldsMap = sn_search.ScriptableAISearchRequestedFieldsUtil.getTableFieldsFromEVAMDefinition(evamId);
    return JSON.stringify(tableToFieldsMap);
}
