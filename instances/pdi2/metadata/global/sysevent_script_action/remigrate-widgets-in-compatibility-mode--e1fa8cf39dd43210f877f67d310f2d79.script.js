if (gs.getProperty('com.snc.par.coreui.migration.run_compatibility_migration', 'true') === 'true' && gs.getProperty("com.glide.par.bulk_migration.invoked", 'false') === 'true' && gs.getProperty("com.glide.par.unified_analytics.enabled", 'false') === 'true') {
		var gr = new GlideRecord("sys_trigger");
		gr.initialize();
		gr.setValue("script", "SNC.MigrationServiceScriptable.migrateIncompatibleArtifacts();");
		gr.setValue("job_id", "81c92ce9c0a8016400e5f0d2f784ea78");
		gr.setValue("trigger_type", 0);
		gr.setValue("name", "Remigrate widgets in compatibility mode");
		var id = gr.insert();

		gs.info('[RemigrationCompatibilityWidgets] queued sys_trigger sys_id = ' + id)
	}
