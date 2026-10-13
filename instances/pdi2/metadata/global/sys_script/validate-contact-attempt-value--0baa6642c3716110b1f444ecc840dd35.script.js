(function executeRule(current, previous /*null when async*/ ) {
    if (current.contact_attempt < 1) {
        gs.addErrorMessage(gs.getMessage("Contact attempt cannot be less than 1"));
        current.setAbortAction(true);
        return;
    }
    var attemptAggregateGr = new GlideAggregate("on_call_template_contact_attempt");
    attemptAggregateGr.addQuery("preference_template", current.preference_template);
    attemptAggregateGr.addQuery("contact_attempt", current.contact_attempt);
    attemptAggregateGr.addQuery('sys_id', '!=', current.getUniqueValue());
    attemptAggregateGr.setLimit(1);
    attemptAggregateGr.query();
    if (attemptAggregateGr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("Contact attempt with value {0} already exists.", current.contact_attempt));
        current.setAbortAction(true);
    }
})(current, previous);
