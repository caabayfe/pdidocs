(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('ais_search_profile_ais_search_source_m2m');
    gr.addQuery('profile', current.profile);
    gr.addQuery('search_source', current.search_source);
    gr.query();
    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('The selected search source was not added because it is already linked to this search profile.'));
        current.setAbortAction(true);
    }

})(current, previous);
