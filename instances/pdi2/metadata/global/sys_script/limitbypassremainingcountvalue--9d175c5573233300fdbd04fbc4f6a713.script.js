(function executeRule(current, previous /*null when async*/ ) {

    var maxBypassCount = gs.getProperty('glide.authenticate.multifactor.setup.bypass.count', '3');
    gs.addInfoMessage(gs.getMessage("Remaining bypass count value can not be more than the value specified in the system property {0}. Replaced with maximum allowed value: {1}", ["glide.authenticate.multifactor.setup.bypass.count", maxBypassCount]));
    current.bypasses_remaining = maxBypassCount;
	
})(current, previous);
