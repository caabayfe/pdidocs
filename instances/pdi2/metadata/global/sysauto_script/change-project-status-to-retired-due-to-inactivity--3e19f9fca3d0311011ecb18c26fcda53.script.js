var gdt = new GlideDateTime();
gdt.addDays(-1 * gs.getProperty("promin.auto_retire_days", 90));

var grProminProject = new GlideRecord("promin_project");
grProminProject.addQuery("auto_retire", true);
grProminProject.addQuery("is_template", false);
grProminProject.addQuery("content_pack", false);
grProminProject.addQuery("sys_updated_on", "<" , gdt);
grProminProject.addQuery("status", "IN", "DRAFT,PUBLISHED");
grProminProject.query();

while(grProminProject.next()) {
		var grProminMiningTracker = new GlideRecord("promin_ua_mining_tracker");
		grProminMiningTracker.addQuery("model_def", grProminProject.getUniqueValue());
		grProminMiningTracker.addQuery("sys_updated_on", ">", gdt);
		grProminMiningTracker.setLimit(1);
		grProminMiningTracker.query();
		if(!grProminMiningTracker.hasNext()) {
			grProminProject.setValue("status", "RETIRED");
			grProminProject.setValue("retired_date", new GlideDateTime());
			grProminProject.update();
		}
}
