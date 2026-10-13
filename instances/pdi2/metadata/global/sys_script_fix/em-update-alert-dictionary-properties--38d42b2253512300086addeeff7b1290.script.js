gs.log("'EM - Update Alert dictionary properties' fix script is running...");

var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "em_alert");
gr.addQuery("internal_type", "collection");
gr.query();
gr.next();
if (gr.getValue("audit") !== "1") { //table is not audited - need to update
	gr.setValue("audit", true);
	if (gr.update()) {
		gs.log("'EM - Update Alert dictionary properties' fix script is updating em_alert table to be 'Audit=true'");
	}
} else {
	gs.log("'EM - Update Alert dictionary properties' fix script - Alert table is already configured as Audit=true");
}


//Changing the internal type of work_notes from journal to journal_input
gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "em_alert");
gr.addQuery("element", "work_notes");
gr.addQuery("internal_type", "journal");
gr.query();

if (gr.next()) {
	gs.log("'EM - Update Alert dictionary properties' fix script - updating internal type of work_notes column to journal_input");
	gr.setValue("internal_type", "journal_input");
	gr.update();

} else {
	gs.log("'EM - Update Alert dictionary properties' fix script - Internal type of work_notes column is already journal_input. No need to update");
}

gs.log("'EM - Update Alert dictionary properties' fix script is exiting...");
