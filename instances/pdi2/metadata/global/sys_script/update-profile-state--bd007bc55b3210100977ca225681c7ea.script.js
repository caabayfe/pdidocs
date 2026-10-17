// Set related search profile to DRAFT when a rule is added, edited or deleted
if (shouldChangeState() && current.state != "NEW") {
    current.state = "DRAFT";
    setProfileToDraft();
} else if (current.state == "NEW") {
    setProfileToDraft();
}


function setProfileToDraft() {

    var profileGR = new GlideRecord('ais_search_profile');
    if (profileGR.get(current.profile)) {

        var end = new GlideDate();
        end.setValue(current.getValue("end_date"));
        var now = new GlideDate();
        if (end < now) {
            var previousState = current.getValue("state");
            current.state = 'EXPIRED';
            // New rules with expired end date should not change profile state
            if (previousState == "NEW")
                return;
        }

        profileGR.state = 'DRAFT';
        profileGR.update();
    }
}

function shouldChangeState() {
    return (current.state != "NEW" && (current.active.changes() ||
        current.locale.changes() ||
        current.start_date.changes() ||
        current.end_date.changes() ||
        current.condition_table.changes() ||
        current.no_triggers.changes() ||
        current.expand_synonyms.changes() ||
        current.trigger.changes() ||
        current.genius_only.changes() ||                                                           
        current.marked_for_deletion.changes()));
}
