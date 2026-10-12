(function executeRule(current, previous /*null when async*/) {
	current.name = GlideStringUtil.escapeHTML(current.name);
})(current, previous);
