(function executeRule(current, previous /*null when async*/) {

	// Add your code here
    var tablesToEnforceStr = gs.getProperty("glide.ais.require_retention_policy","task");
	var tablesToEnforce = tablesToEnforceStr.split(",");
	var table = new TableUtils(current.source);
	var rootTable = table.getAbsoluteBase();
	if (current.retention_policy.nil() && new ArrayUtil().contains(tablesToEnforce, rootTable)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("You must specify a retention policy for an indexed source that indexes the [{0}] table or any of its child tables.", [GlideStringUtil.escapeHTML(rootTable)]));
	}
})(current, previous);
