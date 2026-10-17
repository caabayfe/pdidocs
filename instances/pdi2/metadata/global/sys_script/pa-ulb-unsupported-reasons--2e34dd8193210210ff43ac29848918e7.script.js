(function executeRule(current, previous /*null when async*/ ) {
	if (gs.getProperty('com.snc.pa.dm.enable.mlb', false) == 'false') return;
	
    var message = "If you use a breakdown with Scripts or Related List Conditions, this indicator will support no more than 2 levels of breakdowns.";
    if (current.is_mlb_supported && current.is_mlb_enabled) {
        gs.addInfoMessage(gs.getMessage(message));
    }

})(current, previous);
