var runManually = false;  //update this to true before manually executing the fix script
	var only_ootb_records = true;  //set this to false if all the records (except the new ones shipped as part of EC Pro kiosk) in the 'Get support' table need the update
	var portal = '70cd9f3b734b13001fdae9c54cf6a72f';  //sys_id of the Portal to which records need to be mapped. Default is the sys_id of 'Employee center' Portal
	var ec_ootbRecords = ['7aa65c8843bcfd107d2f52cba5b8f2c6', '66b69c8843bcfd107d2f52cba5b8f225', 'fa0f6ffb43e4fd107d2f52cba5b8f2ec', '3e86ecc443f431507d2f52cba5b8f283', '4a96e00843f431507d2f52cba5b8f2e6'];
	var eck_ootbRecords = ['7002ee8e34d00210f877fa4fa5a8cb0b','3d9e7ac234940210f877fa4fa5a8cbcd','925eb6c234940210f877fa4fa5a8cb59'];   //OOB records shipped as part of EC Pro kiosk

	if(runManually)
		updateRecords(portal, eck_ootbRecords, ec_ootbRecords, only_ootb_records);

	function updateRecords(portal, eck_ootbRecords, ec_ootbRecords, only_ootb_records) {
		gs.info(gs.getMessage('Starting execution of Fix script: Update portal for Get support records'));
		var ootbGetSupportGr = new GlideRecord('sn_ex_sp_get_support');

		if(only_ootb_records)
			ootbGetSupportGr.addQuery('sys_id', ec_ootbRecords);
		else
			ootbGetSupportGr.addQuery('sys_id', 'NOT IN', eck_ootbRecords);

		ootbGetSupportGr.query();
		var record_count = 0;
		while(ootbGetSupportGr.next()) {
			var curr_portal = ootbGetSupportGr.portal;
			if(curr_portal == '')
				ootbGetSupportGr.portal = portal;
			else if(curr_portal.indexOf(portal) == -1)
				ootbGetSupportGr.portal = curr_portal + ',' + portal;
			else
				continue;
			ootbGetSupportGr.update();
			++record_count;
		}
		gs.info(gs.getMessage('Fix script: Update portal for Get support records : Number of records updated : {0}', record_count));
		gs.info(gs.getMessage('Ending execution of Fix script: Update portal for Get support records'));
	}
