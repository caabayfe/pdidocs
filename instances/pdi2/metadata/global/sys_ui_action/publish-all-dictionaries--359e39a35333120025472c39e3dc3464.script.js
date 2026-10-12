function clientSchedule() {
	var ga = new GlideAjax('ScheduleEvent');
	ga.addParam('sysparm_name','scheduleIR');
	ga.addParam('sysparm_event','build_synonym_mapping');
	ga.getXML();
}
