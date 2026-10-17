deleteSections();

function deleteSections() {
	var section = new GlideRecord("sc_ic_section");
	section.addQuery("sc_ic_item_staging", current.sys_id);
	section.query();
	while (section.next())
		section.deleteRecord();
}
