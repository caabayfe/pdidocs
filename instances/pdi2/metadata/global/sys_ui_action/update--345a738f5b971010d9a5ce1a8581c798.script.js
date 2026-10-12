/** Looks up the IDs of the Suggestion Readers associated with the given Reader Group and returns them as an Array<String> **/
function getReaderIDsForReaderGroup(readerGroupSysID) {
    var readerGroupToReaderM2MGR = new GlideRecord('m2m_sys_suggestion_reader_sys_suggestion_reader_group');
    readerGroupToReaderM2MGR.addQuery('sys_suggestion_reader_group_id', readerGroupSysID);
    readerGroupToReaderM2MGR.query();
    var response = [];
    while (readerGroupToReaderM2MGR.next()) {
        response.push(readerGroupToReaderM2MGR.getValue('sys_suggestion_reader_id'));
    }
    return response;
}

function isSuggestionForOtherApplication() {
    if (!current.getValue('suggestion_type').endsWith('for ' + current.context_config_id.name)) {
        gs.addErrorMessage(gs.getMessage("You cannot add this Suggestion Type to \"{0}\" because it was created for a different Search Application.", [current.context_config_id.name]));
        return true;
    }
    return false;
}

/**
 * Checks to see if this reader group should be considered a duplicate of another reader group 
 * that is already on the Search Application. It is considered a duplicate if there is another 
 * suggestion reader group on the Search Application that has the same click_in_mode as the 
 * current record, and shares at least one Suggestion Reader. 
 **/
function isDuplicateReaderGroup() {
    var currentReadersList = getReaderIDsForReaderGroup(current.sys_id);
    var suggestionTypeGR = new GlideRecord('sys_suggestion_reader_group');
    suggestionTypeGR.addQuery('context_config_id', current.context_config_id);
    suggestionTypeGR.addQuery('sys_id', '!=', current.sys_id);
    suggestionTypeGR.query();
    while (suggestionTypeGR.next()) {
        if (suggestionTypeGR.getValue('click_in_mode') == current.click_in_mode) {
            var existingReaderGroupReadersList = getReaderIDsForReaderGroup(suggestionTypeGR.getValue('sys_id'));
            for (var i = 0; i < existingReaderGroupReadersList.length; i++) {
                if (currentReadersList.indexOf(existingReaderGroupReadersList[i]) > -1) {
                    // There's another reader group on the Search App that has the same reader and click-in mode, 
                    // so it's considered a duplicate
                    gs.addErrorMessage(gs.getMessage("You cannot add this Suggestion Type to \"{0}\" because the Suggestion Type \"{1}\" shares a suggestion reader and click-in mode setting.", [current.context_config_id.name, suggestionTypeGR.getValue('suggestion_type')]));
                    return true;
                }
            }
        }
    }
    return false;
}

if (!isDuplicateReaderGroup() && !isSuggestionForOtherApplication()) {
    current.update();
    var searchAppGR = new GlideRecord('sys_search_context_config');
    searchAppGR.get(current.context_config_id);
    action.setRedirectURL(searchAppGR);
} else {
    // Stay on the current form
    action.setRedirectURL(current);
}
