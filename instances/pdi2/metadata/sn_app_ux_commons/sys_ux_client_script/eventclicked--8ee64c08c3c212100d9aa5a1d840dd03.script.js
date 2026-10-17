function handler({api, event, helpers, imports}) {
			    	const all = imports['sn_app_ux_commons.calendarUtilsEx']({api, event, helpers, imports});
    				all.eventClicked();
				}
