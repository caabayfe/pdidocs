if (!pm.isZboot()) {
	var dictGR = new GlideRecord("sys_dictionary");
	dictGR.addQuery("name", "chg_mgt_worker");
	dictGR.addQuery("element", "type");
	dictGR.query();
	if (dictGR.next()) {
		dictGR.setValue("choice", "1");
		dictGR.update();
	}
}
