(function process(/*ResolverEnvironment*/ env) {

	var userSysId = gs.getUserID();
	var retObj = {};

    // Get live profile sys_id
	var liveProfileSysId = '';
    var gr = new GlideRecord('live_profile');
	gr.addQuery('document', userSysId);
	gr.query();
	while (gr.next()) {
		liveProfileSysId = gr.getValue('sys_id');
		retObj.liveProfileSysId = liveProfileSysId;
	}
	// Get container perf fix sys_prop
	var containerLayoutPerfFix = gs.getProperty('sn_agent_workspace.chat.container_layout_css.enabled', false);
	retObj.containerLayoutPerfFix = containerLayoutPerfFix;
	// Get profanity indicator message
	var profanityIndicatorMessage = gs.getProperty('com.glide.cs.profanity.filter.inline_message', '');
	retObj.profanityIndicatorMessage = profanityIndicatorMessage;
	// Get aggressive fetch property
	var aggressivelyFetchMessageEnabled = gs.getProperty('sn_agent_workspace.chat.aggressively_fetch_message.enabled', false);
	retObj.aggressivelyFetchMessageEnabled = aggressivelyFetchMessageEnabled;
	return retObj;

})(env);
