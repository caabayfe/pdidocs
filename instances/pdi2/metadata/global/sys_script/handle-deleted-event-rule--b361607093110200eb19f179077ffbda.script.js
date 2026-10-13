(function executeRule(current, previous /*undefined when async or display*/ ) {
    if (gs.getProperty('evt_mgmt.event_rules.calculate_empty_events', false) === 'true') {
        // update 'em_event_rule_calculation' flag to true
        var gr = new GlideRecord("em_event_rule_calculation");
        gr.addQuery("name", "empty_events_calculation");
        gr.query();
        if (gr.next()) {
            gr.setValue("value", "1");
            gr.update();
        }
        gs.eventQueue("event_rule.update_events_after_delete", gr, gs.getUserID(), gs.getUserName());
    }

})(current, typeof previous != 'undefined' ? previous : null);
