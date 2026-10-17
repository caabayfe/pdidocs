(function executeRule(current, previous /*null when async*/) {
	if (current.operation() == "insert") {
		if (current.end.hasValue())
			return; // record inserted w/ start/end both populated, do nothing

		gs.addInfoMessage(gs.getMessage("Outage opened for {0}", current.cmdb_ci.getDisplayValue()));
		gs.eventQueue("outage.begin", current, current.cmdb_ci, current.cmdb_ci.getDisplayValue());
	}

	if (current.operation() == "update") {
		// we only care here if 1) end just got populated, or 2) message was updated
		if (previous.end.nil() && current.end.hasValue()) { // existing outage was closed
			gs.addInfoMessage(gs.getMessage("Outage closed for {0}", current.cmdb_ci.getDisplayValue()));
			gs.eventQueue("outage.end", current, current.cmdb_ci, current.cmdb_ci.getDisplayValue());
		} else if (current.details.changes()) {
			gs.addInfoMessage(gs.getMessage("Outage details updated for {0}", current.cmdb_ci.getDisplayValue()) + ": " + current.details.getHTMLValue());
			gs.eventQueue("outage.details", current, current.cmdb_ci, current.cmdb_ci.getDisplayValue());
		}
	}
	
	if (current.operation() == "delete") {
		gs.addInfoMessage(gs.getMessage("Outage deleted for {0}", current.cmdb_ci.getDisplayValue()));
		gs.eventQueue("outage.delete", current, current.cmdb_ci, current.cmdb_ci.getDisplayValue());
	}

	var outage = new GlideRecord("cmdb_ci_outage");
	outage.addQuery("cmdb_ci", current.cmdb_ci);
	outage.addQuery("begin", "<=", gs.nowNoTZ());
	outage.addQuery("end", ">", gs.nowNoTZ()).addOrCondition("end", "=", "NULL");
	outage.setLimit(1);
	outage.query();
	var hasCurrentOutage = outage.hasNext();

})(current, previous);
