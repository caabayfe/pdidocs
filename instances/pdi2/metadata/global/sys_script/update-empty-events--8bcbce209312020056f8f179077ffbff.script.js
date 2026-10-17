(function executeRule(current, previous /*null when async*/ ) {
    if (gs.getProperty('evt_mgmt.event_rules.calculate_empty_events', false) === 'true') {
        if (current.operation() == "insert" || current.event_class != previous.event_class ||
            current.filter != previous.filter ||
            current.additional_info_filter != previous.additional_info_filter ||
            current.active != previous.active) {

            // update 'em_event_rule_calculation' flag to true
            var gr = new GlideRecord("em_event_rule_calculation");
            gr.addQuery("name", "empty_events_calculation");
            gr.query();
            if (gr.next()) {
                gr.setValue("value", "1");
                gr.update();
            }

            gs.eventQueue("event_rule.update_events", current, gs.getUserID(), current.operation());
        }
    }
})(current, previous);
