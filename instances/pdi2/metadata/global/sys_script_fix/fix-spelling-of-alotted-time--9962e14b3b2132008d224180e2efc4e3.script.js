(function(){
	var sysDocGr = new GlideRecord("sys_documentation");
	sysDocGr.addQuery("name", "mtg_agenda_item");
	sysDocGr.addQuery("element", "alotted_time");
	sysDocGr.addQuery("label", "Alotted time");
	sysDocGr.addQuery("language", "en");
	sysDocGr.query();
	
	if (sysDocGr.next()) {
		sysDocGr.label = "Allotted time";
		sysDocGr.plural = "Allotted times";
		sysDocGr.update();
	}
})();
