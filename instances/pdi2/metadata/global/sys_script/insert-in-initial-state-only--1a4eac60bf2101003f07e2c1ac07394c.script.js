if( gs.getProperty("com.snc.iam.new_state_flow", "false") == "false" && !current.state.equalsIgnoreCase("new") ){
	current.setAbortAction(true);
	gs.addInfoMessage(gs.getMessage("You may only create incident communication plan with State: 'New'"));
}
else if( gs.getProperty("com.snc.iam.new_state_flow", "false") == "true" && !current.state.equalsIgnoreCase("open") ){
	current.setAbortAction(true);
	gs.addInfoMessage(gs.getMessage("You may only create incident communication plan with State: 'Open'"));
}
