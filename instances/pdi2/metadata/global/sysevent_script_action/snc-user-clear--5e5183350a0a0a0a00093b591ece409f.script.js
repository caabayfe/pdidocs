
			//
			// login was successful so reset the failed attempts count
			//
			var gr = new GlideRecord("sys_user");
			gr.addQuery("user_name", event.parm1.toString());
			gr.query();
			if (gr.next()) {
				gr.failed_attempts = 0;
				gr.last_login = gs.now();
				gr.autoSysFields(false);
				gr.update();
			}
		
