calcPriorityGrouping();

function calcPriorityGrouping(){
	gs.log("Starting 'Event Management -calc priority grouping' fix script");
	gs.eventQueue("alert_priority.calc_priority_grouping", null, gs.getUserID(), gs.getUserName());
	
}
