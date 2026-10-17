var OnCallGroupEscalationUtilsSNC = Class.create();

OnCallGroupEscalationUtilsSNC.prototype = {
	initialize: function () {

	},

	TABLES: {
		CMN_ROTA: 'cmn_rota',
		ON_CALL_GROUP_ESCALATION: 'on_call_group_escalation'
	},

	hasAnotherEscalation: function (currentGroupEscalationGr) {
		var groupId = currentGroupEscalationGr.group + '';
		if (!groupId) {
			return false;
		}

		var groupEscalationGr = new GlideRecord(this.TABLES.ON_CALL_GROUP_ESCALATION);
		groupEscalationGr.addQuery('group', groupId);
		groupEscalationGr.addQuery('sys_id', '!=', currentGroupEscalationGr.getUniqueValue());
		groupEscalationGr.addActiveQuery();
		groupEscalationGr.query();
		return groupEscalationGr.hasNext();
	},

	isValidRotas: function (groupEscalationGr) {
		var groupId = groupEscalationGr.group + '';
		var rotas = groupEscalationGr.rotas + '';
		if (!groupId) {
			return false;
		}
		if (!rotas) {
			return true;
		}
		var rotaGr = new GlideAggregate(this.TABLES.CMN_ROTA);
		rotaGr.addQuery('group', groupId);
		rotaGr.addQuery('sys_id', 'IN', rotas);
		rotaGr.addAggregate('COUNT');
		rotaGr.query();

		if (rotaGr.next()) {
			return rotaGr.getAggregate('COUNT') == rotas.split(',').length;
		}
	},

	type: 'OnCallGroupEscalationUtilsSNC'
};
