(function executeRule(current, previous /*null when async*/) {
	var aclOperation = current.getDisplayValue('operation');
	if (aclOperation == "execute")
		return;

    var restPathAcl = new sn_ws.RestPathAcl(aclOperation, current.name);
	current.name = restPathAcl.getNormalizedName();
    if (!restPathAcl.isExistingResource()) {
        gs.addWarningMessage(gs.getMessage('No matching resource found for {0}', GlideStringUtil.escapeHTML(current.name)));
    }
})(current, previous);
