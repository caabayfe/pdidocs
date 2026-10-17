var recordSysId = '75ec476a43012110b7652ecd2ab8f200'; 
		var gr = new GlideRecord('sys_ux_client_script_include');
		if (gr.get(recordSysId)) {
			gr.deleteRecord();
			gs.info('Legacy ListControllerUtils script include deleted, sysId is {0}', recordSysId );
		} else {
			gs.info('Legacy ListControllerUtils script not found with sysId {0}', recordSysId );
		}

		
