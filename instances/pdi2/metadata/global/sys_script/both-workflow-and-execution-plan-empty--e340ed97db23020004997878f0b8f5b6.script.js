(function executeRule(current, previous) {

	gs.addInfoMessage(gs.getMessage("At least one of flow, workflow or execution plan should be filled. Otherwise, when order is placed, then even on approving request, the stages of requested item won't be updated.")) ;

})(current, previous);
