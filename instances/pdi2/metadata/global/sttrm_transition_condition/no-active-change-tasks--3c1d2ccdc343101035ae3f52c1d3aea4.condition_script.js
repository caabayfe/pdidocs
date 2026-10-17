(function (current) {
    var ga = new GlideAggregate("change_task");
	ga.addQuery("change_request", current.sys_id);
	ga.addQuery("active", 1);
	var qc1 = ga.addQuery("created_from", "workflow");
	qc1.addOrCondition("created_from", "flow");
	ga.query();
	return ga.getRowCount() === 0;
})(current);
