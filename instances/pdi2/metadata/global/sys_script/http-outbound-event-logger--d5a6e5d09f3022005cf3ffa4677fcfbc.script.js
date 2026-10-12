(function executeRule(current, previous /*null when async*/) {

	var midHTTPEventLogger =  new sn_ws.MIDHTTPEventLogger();
    midHTTPEventLogger.logHTTPEvent(current.sys_id);

})(current, previous);
