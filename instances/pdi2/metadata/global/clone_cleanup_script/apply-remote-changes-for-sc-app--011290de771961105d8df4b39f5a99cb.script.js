if (('true' === gs.getProperty('glide.source_control.post_clone_import_enabled', true)) &&
	('true' === gs.getProperty('com.glide.update_operation.queue_app_operation_enabled', true))) {
	gs.print("Scheduling apply remote changes for all existing git repository configurations");
	var importsUrl = new GlideTinyURL().createTinyURL(new SncEnqueueImportFromSCTask().run());
	gs.print("Tracking apply remote changes post clone: " + importsUrl);
} else
  gs.print("Apply remote changes post clone is disabled on this instance");
