(function process( /*ResolverEnvironment*/ env) {
    var args = env.getArguments();
    var interactionId = args.interactionId;

    var gr = new GlideRecord('interaction');
    gr.addQuery('sys_id', interactionId);
    gr.query();

    if (gr.next()) {
        var caller = gs.getUser().getID();
        if (caller != gr.getValue('assigned_to')) {
            return {
                status: "failed",
                message: "Interaction not assigned to requester"
            };
        }
		var currentState = gr.getValue('state');
		if (currentState === 'wrap_up' || currentState === 'closed_complete' || currentState === 'closed_abandoned') 
			return {
				status: "failed",
				message: "Interaction already closed"
			}
        // implement data resolver here
        var util = new global.WrapUpInteractionUtil();
        var newState = "";
        if (util.isWrapUpEnabled(gr)) {
            newState = 'wrap_up';
        } else {
            newState = 'closed_complete';
        }
        gr.setValue('state', newState);
        gr.update();
        return {
            status: "success"
        };
    } else {
        return {
            status: "failed",
            message: "Interaction not found"
        };
    }
})(env);
