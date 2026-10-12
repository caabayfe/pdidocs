var SLAAdvancedConditionUtilSNC = Class.create();
SLAAdvancedConditionUtilSNC.prototype = {

	ADV_CONDITION_TYPE: "adv_condition_type",
	VALCHANGES: "VALCHANGES",
	CHANGESFROM: "CHANGESFROM",
	CHANGESTO: "CHANGESTO",
	COLLECTION: "collection",
	CONTAINS: "CONTAINS",
	CONTRACT_SLA: "contract_sla",

	initialize: function() {
		this._slaUtil = new SLAUtil();
		this._conditionFields = this._slaUtil.getSLAConditionFields();
	},

	updateAllAdvanced: function() {
		var advCondOperators = [this.VALCHANGES, this.CHANGESFROM, this.CHANGESTO];
		var slasWithExtendedGr = new GlideMultipleUpdate(this.CONTRACT_SLA);
		slasWithExtendedGr.addNullQuery(this.ADV_CONDITION_TYPE);
		var cond;
		for (var i = 0; i < this._conditionFields.length; i++) {
			var conditionField = this._conditionFields[i];
			for (var j = 0; j < advCondOperators.length; j++) {
				var operator = advCondOperators[j];
				if (i === 0 && j === 0)
					cond = slasWithExtendedGr.addQuery(conditionField, this.CONTAINS, operator);
				else
					cond.addOrCondition(conditionField, this.CONTAINS, operator);
			}
		}
		slasWithExtendedGr.setValue(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_ADV_ONLY);
		slasWithExtendedGr.execute();
		return this;
	},

	updateAllAdvancedIfJournal: function() {
		var slaTablesGr = new GlideAggregate(this.CONTRACT_SLA);
		slaTablesGr.addQuery(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_ADV_ONLY);
		slaTablesGr.groupBy(this.COLLECTION);
		slaTablesGr.setWorkflow(false);
		slaTablesGr.query();
		while (slaTablesGr.next()) {
			var tableName = slaTablesGr.getValue(this.COLLECTION);
			var journalFields = this._slaUtil.getJournalFields(tableName);
			if (!journalFields || journalFields.length === 0)
				continue;
			var cond;
			var slasWithExtendedGr = new GlideMultipleUpdate(this.CONTRACT_SLA);
			slasWithExtendedGr.addQuery(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_ADV_ONLY);
			for (var i = 0; i < this._conditionFields.length; i++) {
				var conditionField = this._conditionFields[i];
				for (var j = 0; j < journalFields.length; j++) {
					var condValue = journalFields[j] + this.VALCHANGES;
					if (i === 0 && j === 0)
						cond = slasWithExtendedGr.addQuery(conditionField, this.CONTAINS, condValue);
					else
						cond.addOrCondition(conditionField, this.CONTAINS, condValue);
				}
			}
			slasWithExtendedGr.setValue(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_ADV_WITH_JOURNAL);
			slasWithExtendedGr.execute();
		}
		return this;
	},

	updateAllAdvancedIfSystem: function() {
		var slaTablesGr = new GlideAggregate(this.CONTRACT_SLA);
		slaTablesGr.addQuery(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_ADV_ONLY);
		slaTablesGr.groupBy(this.COLLECTION);
		slaTablesGr.setWorkflow(false);
		slaTablesGr.query();
		while (slaTablesGr.next()) {
			var tableName = slaTablesGr.getValue(this.COLLECTION);
			var systemFields = this._slaUtil.getSystemFields();
			if (!systemFields || systemFields.length === 0)
				continue;
			var cond;
			var slasWithExtendedGr = new GlideMultipleUpdate(this.CONTRACT_SLA);
			slasWithExtendedGr.addQuery(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_ADV_ONLY);
			for (var i = 0; i < this._conditionFields.length; i++) {
				var conditionField = this._conditionFields[i];
				for (var j = 0; j < systemFields.length; j++) {
					if (i === 0 && j === 0)
						cond = slasWithExtendedGr.addQuery(conditionField, this.CONTAINS, systemFields[j] + this.VALCHANGES);
					else
						cond.addOrCondition(conditionField, this.CONTAINS, systemFields[j] + this.VALCHANGES);
					cond.addOrCondition(conditionField, this.CONTAINS, systemFields[j] + this.CHANGESFROM);
					cond.addOrCondition(conditionField, this.CONTAINS, systemFields[j] + this.CHANGESTO);
				}
			}
			slasWithExtendedGr.setValue(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_ADV_WITH_SYSTEM);
			slasWithExtendedGr.execute();
		}
		return this;
	},

	updateAllAdvancedIfJournalAndSystem: function() {
		var slaTablesGr = new GlideAggregate(this.CONTRACT_SLA);
		var condition = slaTablesGr.addQuery(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_ADV_WITH_JOURNAL);
		condition.addOrCondition(this.ADV_CONDITION_TYPE, "=", this._slaUtil.SLA_ADV_COND_ADV_WITH_SYSTEM);
		slaTablesGr.groupBy(this.COLLECTION);
		slaTablesGr.setWorkflow(false);
		slaTablesGr.query();
		while (slaTablesGr.next()) {
			var tableName = slaTablesGr.getValue(this.COLLECTION);
			var systemFields = this._slaUtil.getSystemFields();
			var journalFields = this._slaUtil.getJournalFields(tableName);
			if ((!journalFields || journalFields.length === 0) && (!systemFields || systemFields.length === 0))
				continue;
			var journalCond;
			var slasWithExtendedGr = new GlideMultipleUpdate(this.CONTRACT_SLA);
			var advCondition = slasWithExtendedGr.addQuery(this.ADV_CONDITION_TYPE, "=", this._slaUtil.SLA_ADV_COND_ADV_WITH_JOURNAL);
			advCondition.addOrCondition(this.ADV_CONDITION_TYPE, "=", this._slaUtil.SLA_ADV_COND_ADV_WITH_SYSTEM);
			for (var i = 0; i < this._conditionFields.length; i++) {
				var conditionField = this._conditionFields[i];
				// Add conditions for journal fields
				for (var j = 0; j < journalFields.length; j++) {
					var condValue = journalFields[j] + this.VALCHANGES;
					if (i === 0 && j === 0)
						journalCond = slasWithExtendedGr.addQuery(conditionField, this.CONTAINS, condValue);
					else
						journalCond.addOrCondition(conditionField, this.CONTAINS, condValue);
				}
			}
			var systemCond;
			for (var l = 0; l < this._conditionFields.length; l++) {
				conditionField = this._conditionFields[l];
				// Add conditions for system fields
				for (var m = 0; m < systemFields.length; m++) {
					if (l === 0 && m === 0)
						systemCond = slasWithExtendedGr.addQuery(conditionField, this.CONTAINS, systemFields[m] + this.VALCHANGES);
					else
						systemCond.addOrCondition(conditionField, this.CONTAINS, systemFields[m] + this.VALCHANGES);
					systemCond.addOrCondition(conditionField, this.CONTAINS, systemFields[m] + this.CHANGESFROM);
					systemCond.addOrCondition(conditionField, this.CONTAINS, systemFields[m] + this.CHANGESTO);
				}
			}
			slasWithExtendedGr.setValue(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_ADV_WITH_JOURNAL_AND_SYSTEM);
			slasWithExtendedGr.execute();
		}
		return this;
	},

	updateAllNull: function() {
		var slasWithExtendedGr = new GlideMultipleUpdate(this.CONTRACT_SLA);
		slasWithExtendedGr.addNullQuery(this.ADV_CONDITION_TYPE);
		slasWithExtendedGr.setValue(this.ADV_CONDITION_TYPE, this._slaUtil.SLA_ADV_COND_NONE);
		slasWithExtendedGr.execute();
		return this;
	},

	type: 'SLAAdvancedConditionUtilSNC'
};
