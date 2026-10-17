var ConsolidatedIncidentTimeline = Class.create();
ConsolidatedIncidentTimeline.prototype = {
	initialize: function() {
		this.incUtils = new global.IncidentUtils();
	},

	PROPERTIES: {
		num: "num",
		field: "field",
		time: "time",
		author: "author",
		notes: "notes"
	},

	TABLES: {
		INCIDENT:"incident",
		INCIDENT_ALERT: "incident_alert",
		INCIDENT_ALERT_TASK: "incident_alert_task",
		TASK: "task",
		SYS_JOURNAL_FIELD: "sys_journal_field",
		INCIDENT_TASK: "incident_task"
	},

	COLUMNS: {
		COMMENTS: "comments",
		WORK_NOTES: "work_notes",
		ACTIONS_TAKEN: "actions_taken",
		SOURCE: "source",
		COMM_PLAN: "comm_plan",
		NUMBER: "number",
		NAME:"name",
		ELEMENT: "element",
		ELEMENT_ID: "element_id",
		SYS_CREATED_ON: "sys_created_on",
		SYS_CREATED_BY: "sys_created_by",
		SYS_UPDATED_ON: "sys_updated_on",
		SYS_UPDATED_BY: "sys_updated_by",
		VALUE: "value",
		INCIDENT: "incident"
	},

	CONSTANTS: {
		TIMELINE_COLUMN_MAX_LENGTH: 1024000
	},

	OPERATORS: {
		IN: "IN"
	},

	VALUES: {
		NULL: "null"
	},

	ORDER: {
		ASCENDING: "ascending"
	},

	getTimeline: function(incGr, order, journalFields) {
		var ids = [];
		var idNumMap = {};
		var fieldDisplay = {};
		fieldDisplay[this.TABLES.INCIDENT] = {};
		fieldDisplay[this.TABLES.INCIDENT_ALERT] = {};
		fieldDisplay[this.TABLES.INCIDENT_ALERT_TASK] = {};
		fieldDisplay[this.TABLES.INCIDENT_TASK] = {};
		fieldDisplay[this.TABLES.TASK] = {};
		var finalHtml = "";
		var remaining = this.CONSTANTS.TIMELINE_COLUMN_MAX_LENGTH;
		var incId = incGr.sys_id;
		ids.push(incId);
		idNumMap[incId] = incGr.number;
		var incDefaultJournalFields;
		if (gs.nil(journalFields))
			journalFields = [this.COLUMNS.COMMENTS, this.COLUMNS.WORK_NOTES, this.COLUMNS.ACTIONS_TAKEN];

		var alGr = new GlideRecord(this.TABLES.INCIDENT_ALERT);
		var alt = new GlideRecord(this.TABLES.INCIDENT_ALERT_TASK);
		var itGr = new GlideRecord(this.TABLES.INCIDENT_TASK);
		var tGr = new GlideRecord(this.TABLES.TASK);

		for (var fd in journalFields) {
			var f = journalFields[fd];
			var em = incGr.getElement(f);
			if (em + "" != this.VALUES.NULL)
				fieldDisplay[this.TABLES.INCIDENT][f] = em.getLabel();

			em = alGr.getElement(f);
			if (em + "" != this.VALUES.NULL)
				fieldDisplay[this.TABLES.INCIDENT_ALERT][f] = em.getLabel();

			em = alt.getElement(f);
			if (em + "" != this.VALUES.NULL)
				fieldDisplay[this.TABLES.INCIDENT_ALERT_TASK][f] = em.getLabel();

			em = itGr.getElement(f);
			if (em + "" != this.VALUES.NULL)
				fieldDisplay[this.TABLES.INCIDENT_TASK][f] = em.getLabel();
			
			em = tGr.getElement(f);
			if (em + "" != this.VALUES.NULL)
				fieldDisplay[this.TABLES.TASK][f] = em.getLabel();
		}

		alGr.addQuery(this.COLUMNS.SOURCE, incId);
		alGr.query();
		while (alGr.next()) {
			idNumMap[alGr.getUniqueValue()] = alGr.getValue(this.COLUMNS.NUMBER);
			ids.push(alGr.getUniqueValue());
			alt = new GlideRecord(this.TABLES.INCIDENT_ALERT_TASK);
			alt.addQuery(this.COLUMNS.COMM_PLAN, alGr.getUniqueValue());
			alt.query();
			while(alt.next()) {
				idNumMap[alt.getUniqueValue()] = alt.getValue(this.COLUMNS.NUMBER);
				ids.push(alt.getUniqueValue());
			}
		}
		
		/* Incident tasks related to the incident */
		itGr.addQuery(this.COLUMNS.INCIDENT, incId);
		itGr.query();
		while(itGr.next()){
			idNumMap[itGr.getUniqueValue()] = itGr.getValue(this.COLUMNS.NUMBER);
			ids.push(itGr.getUniqueValue());
		}

		var journalEntry = new GlideRecord(this.TABLES.SYS_JOURNAL_FIELD);
		journalEntry.addQuery(this.COLUMNS.NAME, this.OPERATORS.IN, [this.TABLES.INCIDENT_ALERT, this.TABLES.INCIDENT_ALERT_TASK, this.TABLES.INCIDENT_TASK, this.TABLES.INCIDENT, this.TABLES.TASK]);
		journalEntry.addQuery(this.COLUMNS.ELEMENT, this.OPERATORS.IN, journalFields);
		journalEntry.addQuery(this.COLUMNS.ELEMENT_ID, this.OPERATORS.IN, ids);
		if (order == this.ORDER.ASCENDING)
			journalEntry.orderBy(this.COLUMNS.SYS_CREATED_ON);
		else{
			journalEntry.orderByDesc(this.COLUMNS.SYS_CREATED_ON);
			/* Getting the current journal field entries of incident */
			finalHtml += this._prepareCurrentJournalEntriesHtml(incGr, journalFields, fieldDisplay, remaining);
			remaining -= finalHtml.length;
		}

		journalEntry.query();

		while (journalEntry.next()) {
			var gdt = new GlideDateTime();
			gdt.setDisplayValue(journalEntry.getDisplayValue(this.COLUMNS.SYS_CREATED_ON));
			var html =  this.formatHTML({
				num: idNumMap[journalEntry.getValue(this.COLUMNS.ELEMENT_ID)],
				field: fieldDisplay[journalEntry.getValue(this.COLUMNS.NAME)][journalEntry.getValue(this.COLUMNS.ELEMENT)],
				time: gdt,
				author: this.incUtils.getUserById(journalEntry.getValue(this.COLUMNS.SYS_CREATED_BY)),
				notes: GlideStringUtil.getHTMLValue(journalEntry.getValue(this.COLUMNS.VALUE))
			}, remaining);

			finalHtml += html;
			remaining -= html.length;

			if (html.length <= 0)
				break;

		}

		if(order == this.ORDER.ASCENDING)
			finalHtml += this._prepareCurrentJournalEntriesHtml(incGr, journalFields, fieldDisplay, remaining);

		return finalHtml;
	},
	
	_prepareCurrentJournalEntriesHtml: function(incGr, journalFields, fieldDisplay, remaining){
		var cHtml = '';
		for(var fd in journalFields){
			var f = journalFields[fd];
			if(incGr[f] && (incGr[f] + '').indexOf("_123STREAMENTRY321") == -1){
				var gdt = new GlideDateTime();
				gdt.setDisplayValue(incGr.getDisplayValue(this.COLUMNS.SYS_UPDATED_ON));
				var html =  this.formatHTML({
					num: incGr.number,
					field: fieldDisplay[this.TABLES.INCIDENT][f],
					time: gdt,
					author: this.incUtils.getUserById(incGr.getValue(this.COLUMNS.SYS_UPDATED_BY)),
					notes: GlideStringUtil.getHTMLValue(incGr[f])
				}, remaining);
				cHtml += html;
				remaining -= html.length;

				if (html.length <= 0)
					break;
				}
			}
		return cHtml;
	},

	formatHTML: function(nObj, remaining) {
		if (remaining < 0)
			return "";

		var pTag = {
			init: "<p>",
			terminate: "</p>"
		};
		var strongTag = {
			init: "<strong>",
			terminate: "</strong>"
		};
		var finalHtml = "";
		var incNumber = nObj[this.PROPERTIES.num];
		var aField = nObj[this.PROPERTIES.field];
		var gdtT = nObj[this.PROPERTIES.time];
		var aTime = this.incUtils.formatTimeForINCTimeline(gdtT);
		var aAuthor = nObj[this.PROPERTIES.author];
		var aNotes = nObj[this.PROPERTIES.notes];
		finalHtml += pTag.init + strongTag.init + incNumber + " . " + aField + strongTag.terminate + pTag.terminate;
		finalHtml += pTag.init + strongTag.init + aTime + " . " + aAuthor + strongTag.terminate + pTag.terminate;
		//needed because the "\n" from the worknotes are not displayed as new lines in a html field
		aNotes = aNotes.split("\n").join("<br/>");
		if (finalHtml.length + aNotes.length + 20 > remaining) {
			if (finalHtml.length + 7 > remaining)
				return "";

			if (remaining - finalHtml.length < 20) {
				finalHtml += pTag.init + aNotes + pTag.terminate;
				return finalHtml;
			}

			aNotes = aNotes.splice(0, aNotes.length - remaining - 20);
		}
		finalHtml += pTag.init + aNotes + pTag.terminate;
		finalHtml += pTag.init + "&nbsp;" + pTag.terminate;
		return finalHtml;
	},

    type: 'ConsolidatedIncidentTimeline'
};
