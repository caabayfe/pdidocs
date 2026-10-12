
		var script = "new FlowEnginePostUpgrade().process();";

		schedulePropertyChange();

		function schedulePropertyChange() {
			var fourHoursInMs = 4*60*60*1000;
			var fourHoursInSeconds = 4*60*60;

			var gr = new GlideRecord("sys_trigger");
			gr.initialize();
			gr.setValue("state", "ready");
			gr.setValue("trigger_type", "1"); // trigger_repeat
			gr.setValue("name", "Set_engine_major_version_to_2");
			gr.setValue("repeat", new GlideDuration(fourHoursInMs));
			gr.setValue("script", script);
			var startTime = new GlideDateTime();
			// start time.
			startTime.addSeconds(fourHoursInSeconds);
			gr.setValue("next_action", startTime);
			return gr.insert();
		}

		
