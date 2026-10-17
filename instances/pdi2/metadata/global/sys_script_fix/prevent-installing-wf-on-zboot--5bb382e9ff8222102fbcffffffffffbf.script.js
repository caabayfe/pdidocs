sn_applyonce.ApplyOnce.doNotUpdate('sys_hub_flow_51e4991c37822210fcc8966f34924b36.xml');

//remove previous fix script
var gr = new GlideRecord('sys_script_fix'); 
	if (gr.get('3c388a47533331102485ddeeff7b1278')) {
		if(gr.deleteRecord())
			gs.info('Delete the previous version of Prevent installing WF on zboot script'); 
	}
	else {
		gs.info('Previous version of this script was not found'); 
	}
