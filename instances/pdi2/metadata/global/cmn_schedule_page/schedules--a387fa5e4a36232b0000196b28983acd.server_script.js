var g = new GlideRecord('cmn_schedule');
			g.addQuery('name', 'application');
			g.query();
			
			while (g.next()) {
			schedulePage.addSchedule(g.sys_id, '#808080', null, true);
			}
			
			g.initialize();
			g.addQuery('name', 'server');
			g.query();
			
			while (g.next()) {
			schedulePage.addSchedule(g.sys_id, '#73A8F0', null, true);
			}
			
			
			g.initialize();
			g.addQuery('type', 'blackout');
			g.query();
			
			while (g.next()) {
			schedulePage.addSchedule(g.sys_id, '#000', null, true);
			}
			
			g.initialize();
			g.addQuery('name', 'network');
			g.query();
			
			while (g.next()) {
			schedulePage.addSchedule(g.sys_id, '#FF6600', null, true);
			}
			
			//gr = new GlideRecord('change_request');
			//gr.query();
			//while (gr.next()) {
			// var start = gr.start_date.getDisplayValue();
			// var end = gr.end_date.getDisplayValue();
			// var item = schedulePage.addItem(gr, start, end, '', '#318047');
			
			// if (item) {
			// item.setDescription(gr.short_description.toString());
			// }
			//}
