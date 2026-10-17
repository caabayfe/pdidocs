function onCondition() {
	if(g_scratchpad.is_csdm_enabled === true){
		g_form.setDisplay('status', false);
		g_form.setDisplay('life_cycle_stage', true);
		g_form.setDisplay('life_cycle_stage_status', true);
	}else{
		g_form.setDisplay('status', true);
		g_form.setDisplay('life_cycle_stage', false);
		g_form.setDisplay('life_cycle_stage_status', false);
	}
}
