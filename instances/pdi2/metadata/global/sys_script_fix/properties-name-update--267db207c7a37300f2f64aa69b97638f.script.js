changeAlertGroupSupportName();		
    function changeAlertGroupSupportName() {
	gs.log('changing properties name, time: ' + gs.nowDateTime());
	
    function replaceName(prevName,newName){
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('name', prevName);
        gr.query();

        if (gr.next()) {
            gr.name=newName;
            gr.update();
            gs.log('property with name '+ prevName + 'is updated to ' + newName);
        }

    }
	
    replaceName('evt_mgmt.impact_calulation.alert_group_support','evt_mgmt.impact_calculation.alert_group_support');
    replaceName('evt_mgmt.impact_calulation.alert_copy_delay','evt_mgmt.impact_calculation.alert_copy_delay');

	gs.log('finish running fix script, time: ' + gs.nowDateTime());
}
