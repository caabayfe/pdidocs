// Set target search profile to DRAFT when a mirror rule is added, edited or deleted
if (shouldChangeState()) {
    setProfileToDraft();
}

function setProfileToDraft() {
    var profileGR = new GlideRecord('ais_search_profile');
    if (profileGR.get(current.mirror_target)) {
        profileGR.state = 'DRAFT';
        profileGR.update();
    }
}

function shouldChangeState() {
    return (current.active.changes() || current.mirror_source.changes() || current.mirror_target.changes());
}
