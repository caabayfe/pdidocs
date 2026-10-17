(function() {
    var sys_gr = new GlideRecord("sys_ui_message");
    sys_gr.addQuery("keyLIKEPlease select the table & field(s) you want to use to retrieve your similarity results, and the table and fields you want compared");
    sys_gr.query();
	record_found = false;
    while (sys_gr.next()) {
		sys_gr.setValue("key","STEP 2: Please select the table and field(s) you want to use to retrieve your similarity results, and the table and fields you want compared");
		sys_gr.update();
		record_found=true;
    }
	if (record_found==true){
		gs.info("Converted the ampersand symbols to and in sys_ui_message table");
	}
	else {
        gs.info("No record containing ampersand symbol in sys_ui_message table found");
    }

}());
