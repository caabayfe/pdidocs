var fTargetField = 'trigger';
var fTargetTable = 'ais_rule';

var fReplacements = {
    'domain=': 'domains_id=',
    'location=': 'location_id=',
    'roles=': 'roles_id='
};

var keys = Object.keys(fReplacements);


// Find rules using old condition values
var gr = new GlideRecord(fTargetTable);
var grOr = gr.addORQuery(fTargetField, "CONTAINS", keys[0]);
for (var i = 1; i < keys.length; i++)
    grOr.addORQuery(fTargetField, "CONTAINS", keys[i]);
gr.query();

var profileIdsToPublish = [];
var profileNamesToPublish = [];

while (gr.next()) {
    // Find already published profiles to republish later
    var profileId = gr.getValue('profile');
    if (!profileIdsToPublish.includes(profileId)) {
        var profile = new GlideRecord('ais_search_profile');
        profile.get(profileId);
        if (profile.getValue('state') == "PUBLISHED")
            profileNamesToPublish.push(profile.getValue('name'));
    }

    // Replace old condition values to new
    var newCondition = gr.getValue(fTargetField);
    for (var i = 0; i < keys.length; i++)
        newCondition = newCondition.replace(keys[i], fReplacements[keys[i]]);
    gr.setValue(fTargetField, newCondition);
    gr.update();
}

// Republish already published profiles
if (profileNamesToPublish.length > 0) {
    var synchronizer = new sn_ais.Synchronizer();
    for (var i = 0; i < profileNamesToPublish.length; i++)
        synchronizer.publishProfile(profileNamesToPublish[i])
}
