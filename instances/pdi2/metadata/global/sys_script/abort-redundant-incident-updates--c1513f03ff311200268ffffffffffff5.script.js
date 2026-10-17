function onBefore(current, previous) {
	gs.log("Aborting update by 'abort redundant incident updates' business rule");
	current.setAbortAction(true);
   
}
