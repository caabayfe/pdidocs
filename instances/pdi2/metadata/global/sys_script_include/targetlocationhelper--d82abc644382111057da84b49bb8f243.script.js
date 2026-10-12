var TargetLocationHelper = Class.create();

TargetLocationHelper.prototype = {
    initialize: function() {
    },
	
    type: 'TargetLocationHelper'
};

TargetLocationHelper.hasChannelCondition = function(current, channel) {
	var condition = current.condition.toLowerCase();
	
		return (condition.includes('u_liveagent_devicetypestartswith'+channel) || condition.includes('u_liveagent_devicetypeendswith'+channel) || condition.includes('u_liveagent_devicetypelike'+channel) || condition.includes('u_liveagent_devicetype='+channel) || condition.includes('u_liveagent_devicetypematch_pat'+channel));
};
