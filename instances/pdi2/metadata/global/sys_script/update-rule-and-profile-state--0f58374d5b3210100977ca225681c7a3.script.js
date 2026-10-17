// Set related search profile to DRAFT when a rule is added, edited or deleted
if (shouldChangeState() && current.state != "NEW") {
    current.state = "DRAFT";
    setRuleAndProfileToDraft();
} else if (current.state == "NEW") {
    setRuleAndProfileToDraft();
}


function setRuleAndProfileToDraft() {

    var profileid = "";
    var ruleGR = new GlideRecord('ais_rule');
    if (ruleGR.get(current.rule)) {
        // Check Expired Rule
        if (ruleGR.state == "EXPIRED")
            return;

        profileid = ruleGR.profile;
        ruleGR.state = "DRAFT";
        ruleGR.update();
    }

    var profileGR = new GlideRecord('ais_search_profile');
    if (profileGR.get(profileid)) {
        profileGR.state = 'DRAFT';
        profileGR.update();
    }
}

function shouldChangeState() {
    return (current.state != "NEW" && (current.active.changes() ||
        current.type.changes() ||
        current.order.changes() ||
        current.promote_doc.changes() ||
        current.block_doc.changes() ||
        current.boost_number.changes() ||
        current.boost_field_name.changes() ||
        current.boost_value.changes() ||
        current.boost_context_field.changes() ||
        current.marked_for_deletion.changes()));
}
