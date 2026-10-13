(function calc(convGr) {
    var startTime = new GlideDateTime(convGr.sys_created_on);
	var liveAgentTransferTime = convGr.live_agent_transfer_time;
    var conversationMessage = new GlideRecord('sys_cs_message');
    conversationMessage.addQuery('conversation', convGr.sys_id);
    conversationMessage.orderByDesc('sequence');
    conversationMessage.query();
    conversationMessage.next();
    var endTime = new GlideDateTime(conversationMessage.sys_created_on);
	var output = {};
	var duration = GlideDateTime.subtract(startTime, endTime).getNumericValue();
	if (liveAgentTransferTime && liveAgentTransferTime != '') {
		liveAgentTransferTime = new GlideDateTime(convGr.live_agent_transfer_time);
		output['VA Chat Duration'] = GlideDateTime.subtract(startTime, liveAgentTransferTime).getNumericValue();
		output['Live Agent Chat Duration'] = GlideDateTime.subtract(liveAgentTransferTime, endTime).getNumericValue();
	} else {
		output['VA Chat Duration'] = duration;
		output['Live Agent Chat Duration'] = 0;
	}
    return output;
})(convGr);
