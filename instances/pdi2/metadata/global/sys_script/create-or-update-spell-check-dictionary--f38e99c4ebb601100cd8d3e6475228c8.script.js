(function executeRule(current, previous /*null when async*/ ) {

    var profile_id = gs.getSession().getClientData('profile_for_search_source');
    if (profile_id != 'undefined' && profile_id != null) {
        var gr = new GlideRecord('ais_search_profile');
        gr.get(profile_id);
        var profile_label = gr.label;

        var util = new AisConfigurationUtil();
        util.createOrUpdateDefaultSpellcheckDictionary(profile_id, profile_label);

        gs.getSession().clearClientData('profile_for_search_source');
    }
})(current, previous);
