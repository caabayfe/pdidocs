(function executeRule(current, previous) {
        var activity = new GlideRecord(PDConstants.TABLES.PD_ACTIVITY);
        activity.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, current.getUniqueValue());
        activity.query();

        var count = 0;
        while (activity.next()) {
            activity.setValue(PDConstants.FIELDS.ENABLE_AI_AGENT, false);
            activity.update();
            count++;
        }

        gs.info('Disabled AI Agents for ' + count + ' activities in public process: ' + current.name);
})(current, previous);
