(function executeRule(current, previous /*null when async*/) {

	var include = new GlideRecord("sp_css_include");
	include.addQuery("sp_css", current.sys_id);
	include.query();
	while (include.next()) {
		include.name = current.name;
		include.update();
	}

})(current, previous);
