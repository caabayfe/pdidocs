if (shouldChangeState()) {
    current.state = "DRAFT";

    // if the dictionary type is Type Handling, set Search Profile to Draft as well
    if (current.type == "SPELLCHECK") {
        var profileid = "";
        var m2mRecords = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
        m2mRecords.addQuery('dictionary', current.sys_id);
        m2mRecords.query();
        if (m2mRecords.next()) {
            profileid = m2mRecords.profile;
        }

        var profile = new GlideRecord('ais_search_profile');
        profile.addQuery('sys_id', profileid);
        profile.query();
        if (profile.next()) {
            if (profile.state != "NEW") {
                profile.state = "DRAFT";
                profile.update();
            }
        }
    }
}

function shouldChangeState() {
    return (current.state != "NEW" && (current.active.changes() ||
        current.auto_refresh.changes() ||
        current.blocked_field.changes() ||
        current.locale.changes() ||
        current.case_sensitive.changes() ||
        current.punctuation_sensitive.changes() ||
        current.expansion_mode.changes() ||
        current.partial_match.changes() ||
        current.data_source.changes() ||
        current.field.changes()));
}
