// First check that there are Suggestion Types available to add
var suggestionTypeGR = new GlideRecord('sys_suggestion_reader_group');
suggestionTypeGR.addNullQuery('context_config_id');
suggestionTypeGR.addQuery('suggestion_type', 'ENDSWITH', 'for ' + parent.getValue('name'));
suggestionTypeGR.query();
if (!suggestionTypeGR.next()) {
    // Suggestion Types can only be associated with one Search Application, so if they are all already "linked", we don't need to do anything other than let the user know.
    gs.addErrorMessage(gs.getMessage('All available Suggestion Types are already linked to this Search Application.'));
} else {

    var uri = 'sys_suggestion_reader_group_list.do?sysparm_query=context_config_idISEMPTY^suggestion_typeENDSWITHfor ' + parent.getValue('name');
    action.setRedirectURL(uri);

    /* Return to this Search Application form when done */
    var searchApplicationID = action.getGlideURI().get('sysparm_collectionID');
    var searchAppGR = new GlideRecord("sys_search_context_config");
    searchAppGR.get(searchApplicationID);
    action.setReturnURL(searchAppGR);
}
