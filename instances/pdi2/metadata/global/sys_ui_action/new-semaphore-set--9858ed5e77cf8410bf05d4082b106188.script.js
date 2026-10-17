var newID = gs.generateGUID();
var gr = new GlideRecord("sys_semaphore");
gr.query();
while (gr.next()) {
	var sem = new GlideRecord("sys_semaphore_set");
	sem.initialize();
	if (gr.name.equals("WorkerThread") || gr.name.equals("Presence"))
		sem.max_concurrency = 8;
	else
		sem.max_concurrency = 4;
	sem.semaphore_set_id = newID;
	sem.semaphore_id = gr.getUniqueValue();
	sem.insert();
}
gs.addInfoMessage(gs.getMessage("Successfully added semaphore set with ID {0}.", newID));
