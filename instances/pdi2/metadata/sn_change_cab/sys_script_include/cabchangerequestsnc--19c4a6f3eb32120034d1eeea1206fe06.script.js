var CABChangeRequestSNC = Class.create();
CABChangeRequestSNC.prototype = Object.extendsObject(CAB, {

	_addDateRangeQuery: function (gr, startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		cr._addDateRangeQuery(gr, startDate, endDate);
	},

	getRelatedSchedules: function (startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		return cr.getRelatedSchedules(startDate, endDate);
	},

	getChangesWithSameAssignedTo: function (startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		return cr.getChangesWithSameAssignedTo(startDate, endDate);
	},

	getChangesWithSameAssignmentGroup: function (startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		return cr.getChangesWithSameAssignmentGroup(startDate, endDate);
	},

	getChangesAffectingSamePrimaryCI: function (startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		return cr.getChangesAffectingSamePrimaryCI(startDate, endDate);
	},
	
	getScheduleInformation: function (windowArr, startDate, endDate) {
		var cr = new global.ChangeRequestCalendar(this._gr);
		return cr.getScheduleInformation(windowArr, startDate, endDate);
	},

	removeCABAgendaItems: function () {
		var agendaItemGr = new GlideRecord(CAB.AGENDA_ITEM);
		agendaItemGr.addQuery("task", this._gr.getUniqueValue());
		agendaItemGr.addQuery("state", "pending");
		agendaItemGr.query();
		agendaItemGr.deleteMultiple();
	},

	updateAttendeesForAgendaItems: function (previous) {
		var agendaItemGr = new GlideRecord(CAB.AGENDA_ITEM);
		agendaItemGr.addQuery("task", this._gr.getUniqueValue());
		agendaItemGr.addQuery("state", "pending");
		agendaItemGr.query();
		
		if (!agendaItemGr.hasNext())
			return;
		
		if (!CABAgendaItem.TASK_FIELDS_FOR_ATTENDEES)
			return;
		
		var fieldData = {};
		// Get any changes to fields we're interested in for creating attendees related to this Change
		for (var i = 0; i < CABAgendaItem.TASK_FIELDS_FOR_ATTENDEES.length; i++) {
			var fieldName = CABAgendaItem.TASK_FIELDS_FOR_ATTENDEES[i];
			if (this._gr[fieldName].changes()) {
				fieldData[fieldName] = {"currentValue": this._gr.getValue(fieldName)};
				if (previous)
					fieldData[fieldName]["previousValue"] = previous.getValue(fieldName);
			}
		}

		while (agendaItemGr.next())
			new CABAgendaItem(agendaItemGr).refreshAttendeesFromTaskData(fieldData);
	},
	
	updateDecisionforAgendaItem: function(decision) {
		var agendaItemGr = new GlideRecord(CAB.AGENDA_ITEM);
		agendaItemGr.addQuery("task", this._gr.getUniqueValue());
		agendaItemGr.addQuery("cab_meeting.state", "NOT IN", "complete,canceled");
		agendaItemGr.query();
		
		if (!decision)
			decision = this._gr.getValue("approval");

		while (agendaItemGr.next()) {
			var agendaItem = new CABAgendaItem(agendaItemGr);
			if (decision === "approved") {
				if (agendaItem.isPending()) {
					agendaItem.setPreApproved();
				
					if (agendaItemGr.cab_meeting.complete_preapproved_changes == true)
						agendaItem.setComplete();
				}
				else if (agendaItem.isInProgress() || agendaItem.isPaused())
					agendaItem.setApproved();
				
				agendaItem.update();
			}
			else if (decision === "rejected") {
				var cabMeeting = new CABMeeting(agendaItemGr.cab_meeting.getRefRecord());
				if (cabMeeting.isPending() && !agendaItem.isPending())
					agendaItem.setPending();
				
				agendaItem.reject();
			}
		}
	},
	
	addApprovalDecisionToMeetingNotes: function(decisionDisplayValue) {
		var agendaItemGr = new GlideRecord(CAB.AGENDA_ITEM);
		agendaItemGr.addQuery("task", this._gr.getUniqueValue());
		agendaItemGr.addQuery("cab_meeting.state", "in_progress");
		agendaItemGr.query();

		if (!decisionDisplayValue)
			decisionDisplayValue = this._gr.getDisplayValue("approval");

		while (agendaItemGr.next()) {
			var agendaItem = new CABAgendaItem(agendaItemGr);
			var meetingGr = agendaItemGr.cab_meeting.getRefRecord();
			if (meetingGr && meetingGr.auto_add_agenda_decisions)
				agendaItem.addDecisionToMeetingNotes(decisionDisplayValue, gs.getUserDisplayName());
		}
	},

	toJS: function(includeCanWrite, dotWalkFields) {
		var jsObj = this._toJS(this._gr, includeCanWrite);
		
		
		if (dotWalkFields && Array.isArray(dotWalkFields))
			dotWalkFields.forEach(function (fieldName) {
				if (!fieldName)
					return;
				
				var fieldPath = fieldName.split(".");
				var element = this._gr;
				fieldPath.forEach(function(pathEl) {
					element = element[pathEl];
				});
				
				jsObj[fieldName] = {
					"value": element.toString(),
					"display_value": element.getDisplayValue()
				};
			}, this);

		return jsObj;
	},
	
	toSPForm: function() {
		if (!this._gr.canRead())
			return null;
		
		if (!this._cabFormUtil)
			this._cabFormUtil = new global.CABFormUtil();
		
		return this._cabFormUtil.getForm(this._gr);
	},

    type: 'CABChangeRequestSNC'
});
