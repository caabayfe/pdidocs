var g = new GlideRecord('cmn_schedule');
			g.addQuery('type', 'app blackout');
			g.query();
			while (g.next()) {
			schedulePage.addSchedule(g.sys_id, '#808080', null, false);
			}
			
			//Application calendar
			g.initialize();
			g.addQuery('type', 'application');
			g.query();
			while (g.next()) {
			schedulePage.addSchedule(g.sys_id, '#B22222', null, false);
			}
			
			//Netgear calendar
			g.initialize();
			g.addQuery('type', 'netgear');
			g.query();
			while (g.next()) {
			schedulePage.addSchedule(g.sys_id, '#DA70D6', null, false);
			}
			
			//Server calendar
			g.initialize();
			g.addQuery('type', 'server');
			g.query();
			while (g.next()) {
			schedulePage.addSchedule(g.sys_id, '#00FFFF', null, false);
			}
			
			//Changes with no assigned user
			gr = new GlideRecord('change_request');
			gr.addQuery('assigned_to', '==', '');
			gr.query();
			while (gr.next()) {
			var start = gr.start_date.getDisplayValue();
			var end = gr.end_date.getDisplayValue();
			var item = schedulePage.addItem(gr, start, end, '', '#318047'); 
			if (item){
			item.setDescription(gr.short_description.toString());
			}
			
			}
			
			//Changes with assigned users
			gu = new GlideRecord('change_request');
			gu.addQuery('assigned_to', '!=', '');
			gu.query();
			while (gu.next()) {
			var start1 = gu.start_date.getDisplayValue();
			var end1 = gu.end_date.getDisplayValue();
			var item1 = schedulePage.addItem(gu, start1, end1, '', '#800080'); 
			if (item1){
			item1.setDescription(gu.assigned_to.name);
			}
			
			}
			
 
