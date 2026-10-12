// Since changes to search sources affect the default derived spelling dictionary, we should set linked profile sate to DRAFT

var profileGR = new GlideRecord('ais_search_profile');
if (profileGR.get(current.profile)) {
    if (profileGR.state != "NEW") {
        profileGR.state = 'DRAFT';
        profileGR.update();
    }
}
