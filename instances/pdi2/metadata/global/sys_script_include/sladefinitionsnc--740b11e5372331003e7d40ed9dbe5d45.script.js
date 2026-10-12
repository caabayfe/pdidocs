var SLADefinitionSNC = Class.create();

SLADefinitionSNC.SLA_DEF = "contract_sla";
SLADefinitionSNC.SCHEDULE = "cmn_schedule";

SLADefinitionSNC.prototype = {
	FIELD_ADVANCED_COND_TYPE: "adv_condition_type",

	initialize: function(slaDefGr) {
		this.slaDefGr = null;
		this.schedule = null;
		this.duration = null;

		if (slaDefGr && slaDefGr instanceof GlideRecord && slaDefGr.getRecordClassName() == "contract_sla") {
			this.slaDefGr = slaDefGr;
			this.duration = new GlideDuration(this.slaDefGr.duration.dateNumericValue());

			if (!this.slaDefGr.schedule.nil())
				this.schedule = new GlideSchedule(this.slaDefGr.getValue("schedule"));
		}
	},

	/**
	 * Generates a possible breach time for the given schedule and duration.
	 *
	 * This method does not generate a end date using relative durations.
	 *
	 * @param startTime - GlideDateTime
	 * @returns GlideDateTime representing the breach time of an SLA
	 */
	getExampleBreachTime: function(startTime) {
		if (!this.duration)
			return null;

		if (!startTime)
			startTime = new GlideDateTime();

		// Get a new duration every time to prevent issues with multiple calls without re-setting the duration
		var duration = new GlideDuration(this.duration);
		var endTimeGdt = new GlideDateTime(startTime);
		if (!this.schedule) {
			endTimeGdt.add(duration.getNumericValue());
			return endTimeGdt;
		}

		return this.schedule.add(endTimeGdt, duration);
	},

	/**
	 * Creates a new GlideSchedule object from the given scheduleId and sets it
	 *
	 * @param scheduleId
	 * @returns Boolean whether the variable was set or not
	 */
	setSchedule: function(scheduleId) {
		if (!scheduleId) {
			this.schedule = null;
			return false;
		}

		var scheduleGr = new GlideRecord(SLADefinitionSNC.SCHEDULE);
		if (!scheduleGr.get(scheduleId)) {
			this.schedule = null;
			return false;
		}

		this.schedule = new GlideSchedule(scheduleId);
		return true;
	},

	/**
	 * Creates a new Duration object from the given duration and sets it
	 *
	 * @param duration
	 * @returns Boolean whether the variable was set or not
	 */
	setDuration: function(duration) {
		if (!duration)
			return false;

		this.duration = new GlideDuration(duration);
	},

	validateDurationValue: function() {
		if (!this.duration)
			return null;

		var durationGD = new GlideDuration(this.duration);
		var maxDuration = SLAProperties.getMaximumDurationAllowed();

		if (durationGD.getNumericValue() > (parseInt(maxDuration) * durationGD.A_DAY_IN_MS))
			return gs.getMessage("Duration must not exceed {0} days", [maxDuration]);
	},

	setAdvancedConditionUsage: function(isRunUpdate /* boolean */ ) {
		if (!this.slaDefGr)
			return;

		var slaUtil = new SLAUtil();
		var advCondOperatorsRe = /VALCHANGES|CHANGESFROM|CHANGESTO/g;
		var conditionFields = slaUtil.getSLAConditionFields();
		var conditionFieldsWithAdvanced = []; // We'll populate this one with the condition fields that have Advanced Condition usage
		var hasAdvancedCondition = false;
		var hasAdvancedConditionAndJournal = false;
		var hasAdvancedConditionAndSystem = false;

		// Check all conditionf fields that have any advanced condition use
		for (var i = 0; i < conditionFields.length; i++) {
			var conditionField = conditionFields[i];
			var conditionValue = this.slaDefGr[conditionField].getValue();

			if (slaUtil.skipConditionCheck(conditionField, conditionValue, this.slaDefGr))
				continue;

			if (advCondOperatorsRe.test(conditionValue)) {
				hasAdvancedCondition = true;
				conditionFieldsWithAdvanced.push(conditionField);
			}
		}

		// Now that we know we have advanced condition usage, check if any Journal fields
		if (hasAdvancedCondition) {
			var journalFields = slaUtil.getJournalFields(this.slaDefGr.getValue("collection"));
			var systemFields = slaUtil.getSystemFields();

			if ((journalFields && journalFields.length !== 0) || (systemFields && systemFields.length !== 0)) {
				for (var i = 0; i < conditionFieldsWithAdvanced.length; i++) {
					var conditionField = conditionFieldsWithAdvanced[i]; // Using the reduced (almost certainly) array to check for journals
					var conditionValue = this.slaDefGr[conditionField].getValue();

					if (slaUtil.skipConditionCheck(conditionField, conditionValue, this.slaDefGr))
						continue;

					if (journalFields && journalFields.length !== 0)
						for (var j = 0; j < journalFields.length; j++) {
							var condValue = journalFields[j] + "VALCHANGES";
							if (conditionValue.indexOf(condValue) >= 0) {
								hasAdvancedConditionAndJournal = true;
								break;
							}
						}

					if (systemFields && systemFields.length !== 0)
						for (var l = 0; l < systemFields.length; l++)
							if (conditionValue.indexOf(systemFields[l] + "VALCHANGES") > -1 ||
								conditionValue.indexOf(systemFields[l] + "CHANGESFROM") > -1 ||
								conditionValue.indexOf(systemFields[l] + "CHANGESTO") > -1) {
								hasAdvancedConditionAndSystem = true;
								break;
							}

					if (hasAdvancedConditionAndJournal && hasAdvancedConditionAndSystem)
						break;
				}
			}
		}

		if (hasAdvancedConditionAndJournal && hasAdvancedConditionAndSystem)
			this.slaDefGr.setValue(this.FIELD_ADVANCED_COND_TYPE, slaUtil.SLA_ADV_COND_ADV_WITH_JOURNAL_AND_SYSTEM);
		else if (hasAdvancedConditionAndJournal)
			this.slaDefGr.setValue(this.FIELD_ADVANCED_COND_TYPE, slaUtil.SLA_ADV_COND_ADV_WITH_JOURNAL);
		else if (hasAdvancedConditionAndSystem)
			this.slaDefGr.setValue(this.FIELD_ADVANCED_COND_TYPE, slaUtil.SLA_ADV_COND_ADV_WITH_SYSTEM);
		else if (hasAdvancedCondition)
			this.slaDefGr.setValue(this.FIELD_ADVANCED_COND_TYPE, slaUtil.SLA_ADV_COND_ADV_ONLY);
		else
			this.slaDefGr.setValue(this.FIELD_ADVANCED_COND_TYPE, slaUtil.SLA_ADV_COND_NONE);

		if (isRunUpdate === true)
			this.slaDefGr.update();
	},

	_skipConditionCheck: function(conditionField, conditionValue) {
		new SLAUtil().skipConditionCheck(conditionField, conditionValue, this.slaDefGr);
	},

	getNoAuditFieldsinConditions: function() {
		var noAuditFieldsInConditions = {};

		if (!this.slaDefGr)
			return noAuditFieldsInConditions;

		var tableName = this.slaDefGr.getValue("collection");
		if (!GlideTableDescriptor.isValid(tableName))
			return noAuditFieldsInConditions;

		var slaUtil = new SLAUtil();
		var noAuditFieldsForTable = slaUtil.getNoAuditFields(tableName);
		
		if (!noAuditFieldsForTable)
			return noAuditFieldsInConditions;
		
		var noAuditFieldNames = Object.keys(noAuditFieldsForTable);
		if (noAuditFieldNames.length === 0)
			return noAuditFieldsInConditions;

		var conditionFields = slaUtil.getSLAConditionFields();
		if (!conditionFields || !Array.isArray(conditionFields))
			return noAuditFieldsInConditions;

		var arrayUtil = new ArrayUtil();
		for (var i = 0; i < conditionFields[i].length; i++) {
			var conditionFieldName = conditionFields[i];
			if (!this.slaDefGr.isValidField(conditionFieldName))
				continue;

			var fieldsInCondition = slaUtil.getRelatedFieldsFromEncodedQuery(tableName, this.slaDefGr.getValue(conditionFieldName));
			var noAuditFieldsInCondition = arrayUtil.intersect(fieldsInCondition, noAuditFieldNames);
			if (noAuditFieldsInCondition.length === 0)
				continue;

			noAuditFieldsInConditions[conditionFieldName] = [];
			noAuditFieldsInCondition.forEach(function(fieldName) {
				noAuditFieldsInConditions[conditionFieldName].push({name: fieldName, label: noAuditFieldsForTable[fieldName].label})
			});
		}

		return noAuditFieldsInConditions
	},

	type: 'SLADefinitionSNC'
};
