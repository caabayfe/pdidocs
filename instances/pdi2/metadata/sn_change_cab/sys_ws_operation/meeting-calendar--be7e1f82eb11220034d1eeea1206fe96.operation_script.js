(function process(request, response) {
	var startDate = request.pathParams.startDate;  //Expects UTC ms
	var endDate = request.pathParams.endDate; // Expects UTC ms
	
	if (isNaN(startDate) || isNaN(endDate))
		return new sn_ws_err.BadRequestError("Requires start and end dates in UTC ms");
	
	var startDateTime = new GlideDateTime();
	startDateTime.setValue(parseInt(startDate));
	var endDateTime = new GlideDateTime();
	endDateTime.setValue(parseInt(endDate));
	
	var enqAgQry = "cab_meeting.start>=" + startDateTime + "^cab_meeting.start<" + endDateTime + "^NQcab_meeting.end>=" + startDateTime + "^cab_meeting.end<" + endDateTime;
	var agendaItemAg = new GlideAggregate(CAB.AGENDA_ITEM);
	agendaItemAg.addAggregate("COUNT");
	agendaItemAg.addEncodedQuery(enqAgQry);
	agendaItemAg.groupBy(CAB.MEETING);
	agendaItemAg.orderBy(CAB.MEETING);
	agendaItemAg.query();
	
	var agendaCount = {};
	while (agendaItemAg.next())
		agendaCount[agendaItemAg.cab_meeting+""] = agendaItemAg.getAggregate("COUNT");
	

	var enqQry = "start>=" + startDateTime + "^start<" + endDateTime + "^NQend>=" + startDateTime + "^end<" + endDateTime;
	meetingGr = new GlideRecord(CAB.MEETING);
	meetingGr.addEncodedQuery(enqQry);
	meetingGr.addQuery("state", "!=", CAB.MEETING_STATE.CANCELED);
	meetingGr.orderBy("start");
	meetingGr.orderBy("end");
	meetingGr.query();
	
	var meeting = new CABMeeting(meetingGr);
	
	var result= [];
	
	while(meetingGr.next()) {
		var jsonMeeting = meeting.toJS();
		
		if (typeof agendaCount[meeting.getValue("sys_id")+""] !== "undefined") {
			jsonMeeting.hasAgendaItems = true;
			jsonMeeting.agendaItemCount = agendaCount[meeting.getValue("sys_id")+""];
		}
		else
			jsonMeeting.hasAgendaItems = false;
		
		result.push(jsonMeeting);
	}
	
	response.setBody(result);

})(request, response);
