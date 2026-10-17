(function(context, pageParams) {
    context.props_details.nav_payload = {
        route: 'prompt-injection',
        params: {
			    t : Date.now()
		    }
    };
    context.props_details.telemetryData = {
        event_name: "Prompt Injection clicked",
        title: "Prompt Injection",
        append_to_payload: {}
    };
    context.title = sn_i18n.Message.getMessage("sn_nowassist_admin", "Prompt Injection");
})(context, pageParams);
