(function executeRule(current, previous /*null when async*/ ) {
    var agendaItem = new sn_change_cab.CABAgendaItem(current);
    agendaItem.updateCABDate();
	var previousTaskSysId = previous.task + "";
    if (current.operation() + "" === "update" && previousTaskSysId && current.task + "" !== previousTaskSysId) {
        var previousChangeRequestGr = previous.task.getRefRecord();
        previousChangeRequestGr.cab_date_time = "";
        previousChangeRequestGr.update();
    }

})(current, previous);
