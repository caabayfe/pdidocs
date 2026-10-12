var tableGR = new GlideRecord("sys_db_object");
		tableGR.addQuery("name", "par_visualization");
		tableGR.query();

		if (tableGR.next()) {
			var parentTable = tableGR.getDisplayValue("super_class.name");
			if (parentTable == "analytics_visualization") {
				gs.info("Reparenting already completed for par_visualization table");
				var scriptGR = new GlideRecord("sysauto_script");
				if (scriptGR.get("48ef1eccffc203101a31ffffffffffc8")) {
					scriptGR.setValue("active", false);
					scriptGR.updateMultiple();
				}
			} else {
				// Run the reparenting
				gs.info("Running the reparenting script for par_visualization table");
				var helper = new AnalyticsCenterUpgradeHelper();
				helper.runVisualizationReparenting();

				runDataMigration();
			}
		}

		function runDataMigration() {
			// Create sys_trigger entry to run data migration run once on load
			var gr = new GlideRecord('sys_trigger');
			gr.setValue('name', 'Migrate analytics center data run once');
			gr.setValue('job_id', '307a3d68ff0132109371ffffffffff84');
			gr.setValue('trigger_type', '0');

			var gdt = new GlideDateTime();
			gdt.addSeconds(10);

			gr.setValue('next_action', gdt.getValue());
			gr.insert();
		}
