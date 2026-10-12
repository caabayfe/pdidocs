(function executeRule(current, previous /*null when async*/ ) {

    var consumerAccountContextGR = new GlideRecord('sys_cs_consumer_account_context');
    consumerAccountContextGR.addActiveQuery();
    consumerAccountContextGR.query();

    while (consumerAccountContextGR.next()) {
        if (consumerAccountContextGR.getUniqueValue() == current.getUniqueValue())
            continue;

        consumerAccountContextGR.setWorkflow(false);
        consumerAccountContextGR.setValue('is_default', false);
        consumerAccountContextGR.update();
    }

})(current, previous);
