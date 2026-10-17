if (current.name.endsWith('_default_spell_check_dictionary') && current.operation() == "delete") {
    gs.addErrorMessage(gs.getMessage("You cannot delete the auto-generated Typo Handling dictionary. You can either disable Typo Handling in your UI or remove all fields from contributing to this dictionary"));
    current.setAbortAction(true);
}
if (current.operation() == "delete") {
    var preventDelete = false;
    var profileNames = [];
    var profiles = new GlideRecord('ais_search_profile_ais_dictionary_m2m');
    profiles.addQuery('dictionary', current.sys_id);
    profiles.query();
    
    while (profiles.next()) {
        preventDelete = true;
        profileNames.push(GlideStringUtil.escapeHTML(profiles.profile.label));
    }
    if (preventDelete) {
        gs.addErrorMessage(gs.getMessage("You cannot delete this dictionary. It is still linked to the following Search Profiles: {0}", profileNames.join(",")));
        current.setAbortAction(true);
    } else
        deleteDictionary();

} else if (current.operation() == "update" && current.active.changes() && current.active == false)
    deleteDictionary();

function deleteDictionary() {
    var result = new sn_ais.Synchronizer().deleteDictionary(current.name);
    if (result)
        gs.addInfoMessage(gs.getMessage("Dictionary deleted"));
    else {
        gs.addErrorMessage(gs.getMessage("Failed to delete dictionary, please check log for more details"));
        current.setAbortAction(true);
    }
}
