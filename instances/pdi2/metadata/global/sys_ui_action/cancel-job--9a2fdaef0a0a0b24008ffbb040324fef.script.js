cancelJob();
function cancelJob() { 
	if (SNC.GlideProgressWorkerPool.remove(current.sys_id)) {
			var gr = new GlideRecord("sys_trigger");
			gr.addQuery("document", "sys_progress_worker");
			gr.addQuery("document_key", current.sys_id);
			gr.query();

			if (!gr.next()) {
				gs.log("Could not find scheduled job scheduled job for BackgroundProgressWorker Id: " + current.sys_id);
				return;
			}
		
			gs.log("Cancelling scheduled job for BackgroundProgressWorker Id: " + current.sys_id + " , deleting Scheduled Job: " + gr.sys_id);
			gr.deleteRecord();
			gs.log("Background Progress Worker " + current.sys_id + " got canceled");
	}

	current.state = "cancelled";
	current.update();
}
