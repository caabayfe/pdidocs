
			
			var sysTrigger = new GlideRecord("sys_trigger");
			sysTrigger.initialize();
			sysTrigger.name='FD : compact table';
			sysTrigger.job_id = '81c92ce9c0a8016400e5f0d2f784ea78';

			var action_date = new GlideDateTime(gs.nowDateTime());
			action_date.addDays(14);

			sysTrigger.next_action = action_date;
			sysTrigger.script= 'sn_fd.FlowAPI.compactSysJsonChunk();';
			sysTrigger.trigger_type = 0;
			sysTrigger.insert();
