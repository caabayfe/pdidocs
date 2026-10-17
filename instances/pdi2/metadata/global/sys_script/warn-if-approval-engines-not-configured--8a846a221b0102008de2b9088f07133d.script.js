/* global ApprovalEngineUtils, gs, current, previous */
(function executeRule(current, previous /*undefined when async or display*/) {
	var engine = new ApprovalEngineUtils().getEngineForTable(current.table + '');
	if (engine != "approval_engine") {
		var warnMsg = gs.getMessage("This rule will not run because Approval Engines are not configured on table {0}.", current.table);
		var linkTxt = gs.getMessage("Configure Approval Engines.");
		var s = warnMsg + ' <a id="permalink" class="linked" style="color:#666666;" href="approval_engines.do">';
		s += linkTxt + '</a>';
		gs.addInfoMessage(s);
	}
})(current, typeof previous != 'undefined' ? previous : null);
