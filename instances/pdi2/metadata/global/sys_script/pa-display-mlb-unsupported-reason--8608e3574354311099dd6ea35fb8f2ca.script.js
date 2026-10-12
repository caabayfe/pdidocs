(function executeRule(current, previous /*null when async*/ ) {
	if (gs.getProperty('com.snc.pa.dm.enable.mlb', false) == 'false') return;
    var reason = '';
    var hasReason = false;
    var reasonGr = new GlideRecord("pa_cdc_unsupported_reasons");
    reasonGr.addQuery("pa_indicator", current.id);
    reasonGr.query();
    var msg = gs.getMessage("pa_indicators_automated.text.support_mlb") + "<br/> <ul>";
    while (reasonGr.next()) {
        msg = msg + "<li> " + reasonGr.getValue('reason');
        hasReason = true;
    }
    if (hasReason) {
        gs.addInfoMessage(msg + "</ul>");
    }
})(current, previous);
