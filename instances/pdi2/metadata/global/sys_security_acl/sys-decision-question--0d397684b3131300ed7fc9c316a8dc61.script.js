answer = true;

if(gs.getProperty('com.glide.decision_table.gate_feature') == 'true' && !(gs.hasRole('maint'))) {
	answer = false;
} 
