var applicationMenu = new GlideRecord("sys_app_application"); 
if(!applicationMenu.get("c27d2864e9693110f877eebc1a3288ff")) {
	var updateRecord = new GlideRecord("sys_update"); 
	updateRecord.addQuery("name", "sys_app_application_c27d2864e9693110f877eebc1a3288ff.xml"); 
	updateRecord.query();
	while (updateRecord.next()){
		updateRecord.deleteRecord(); 
	}
}
