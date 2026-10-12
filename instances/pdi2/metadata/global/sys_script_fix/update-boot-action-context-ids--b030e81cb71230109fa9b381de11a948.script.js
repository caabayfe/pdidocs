var fTargetField = 'boost_context_field';
var fTargetTable = 'ais_rule_action';

var fReplacements = {
    'domain': 'domains_id',
    'location': 'location_id',
    'roles': 'roles_id'
};

var gr = new GlideRecord(fTargetTable);
gr.addQuery(fTargetField, "IN", Object.keys(fReplacements));
gr.query();

var ruleIdsCheckedForPublish = [];
var profileIdsToPublish = [];
var profileNamesToPublish = [];

while (gr.next()) {
    // Find already published profiles to republish later
    var ruleId = gr.getValue('rule');
    if (!ruleIdsCheckedForPublish.includes(ruleId)) {
        ruleIdsCheckedForPublish.push(ruleId);
        var rule = new GlideRecord('ais_rule');
        rule.get(ruleId);
        var profileId = rule.getValue('profile');
        if (!profileIdsToPublish.includes(profileId)) {
            var profile = new GlideRecord('ais_search_profile');
            profile.get(profileId)
            if (profile.getValue('state') == "PUBLISHED")
                profileNamesToPublish.push(profile.getValue('name'));
        }
    }
    var key = gr.getValue(fTargetField);
    gr.setValue(fTargetField, fReplacements[key]);
    gr.update();
}

// Republish already published profiles
if (profileNamesToPublish.length > 0) {
    var synchronizer = new sn_ais.Synchronizer();
    for (var i = 0; i < profileNamesToPublish.length; i++)
        synchronizer.publishProfile(profileNamesToPublish[i])
}
