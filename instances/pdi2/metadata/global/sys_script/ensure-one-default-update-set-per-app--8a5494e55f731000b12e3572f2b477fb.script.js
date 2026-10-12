
			var us = new GlideRecord("sys_update_set");
			us.addQuery("application", current.application);
			us.addQuery("is_default", true);
			us.addQuery("sys_id", "!=", current.sys_id);
			us.query();
			while (us.next()) {
				us.setWorkflow(false);
				us.setValue("is_default", false);
				us.update();
			}
			
