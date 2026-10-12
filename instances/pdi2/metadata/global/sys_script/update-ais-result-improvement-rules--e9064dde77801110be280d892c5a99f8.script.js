(function executeRule(current, previous /*null when async*/ ) {
    if(gs.getProperty('glide.knowman.versioning.enabled', 'false') == 'false')
        return;
    var profiles = {};
    var newSysId = current.getUniqueValue();
    var publishedOldKBs = getPublishedKB(current);
    updateRIRforField(publishedOldKBs, current, profiles, 'promote_doc');
    updateRIRforField(publishedOldKBs, current, profiles, 'block_doc');
    publishProfiles(profiles);

})(current, previous);

function updateRIRforField(publishedOldKBs, current, profiles, field) {
    var table = 'kb_knowledge';
    var actionGr = new GlideRecord('ais_rule_action');
    var newSysId = current.getUniqueValue();
    var title = current.getValue('short_description');
    actionGr.addQuery(field, 'IN', publishedOldKBs);
    actionGr.query();
    while (actionGr.next()) {
        var profileSysId = actionGr.rule.profile;
        profiles[profileSysId] = true;
        actionGr.setValue(field, table + '.' + newSysId);
        actionGr.setValue('label', title);
        actionGr.update();
    }
}

function getPublishedKB(current) {
    var res = [];
    var article_id = current.getValue('article_id');
    var kbGr = new GlideRecord('kb_knowledge');
    kbGr.addQuery('article_id', article_id);
    kbGr.addQuery('sys_id', '!=', current.getUniqueValue());
    kbGr.query();
    while (kbGr.next()) {
        res.push('kb_knowledge' + '.' + kbGr.getUniqueValue());
    }
    return res.join(',');
}

function publishProfiles(profiles) {
    var profileGr = new GlideRecord('ais_search_profile');
    for (var profile in profiles) {
        profileGr.get(profile);
        var state = profileGr.getValue('state');
        var name = profileGr.getValue('name');
        if (state != 'NEW') {
            var result = new sn_ais.Synchronizer().publishProfile(name);
            if (result)
                gs.info("Search profile: " + name + " is published");
            else
                gs.warn("Failed to publish Search Profile: " + name + ", please check log for more details");
        }
    }
}
