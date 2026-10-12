(function executeRule(current, previous /*null when async*/ ) {
    current.active = false;
    // Delivery Plan Specific, update the state here, so that TaskStateUtil, won't be able set the state.
    if (!current.delivery_plan.nil()) {
        if (current.stage == 'closed_incomplete' || current.stage == 'Request Cancelled')
            current.state = 4;
        else if (current.stage == 'closed_skipped')
            current.state = 7;
    }

    // If we started a workflow for this item, cancel it
    if ((current.stage == 'Request Cancelled') && current.context && !current.context.nil()) {
        var w = new Workflow();
        var gr = new GlideRecord('wf_context');

        if (gr.get(current.context))
            w.cancelContext(gr);
    }

})(current, previous);
