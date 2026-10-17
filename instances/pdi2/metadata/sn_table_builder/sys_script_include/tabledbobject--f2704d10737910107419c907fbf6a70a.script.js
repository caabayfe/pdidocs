var TableDBObject = Class.create();
TableDBObject.prototype = {
	/**
	 * @param {document_id | GlideRecord}
	 */
	initialize(target) {
		if (TBUtil.isGRInstance(target)) this.gr = target;
		else {
			var gr = new GlideRecord(TBConstants.SYS_CLASS_DB_OBJECT);
			gr.get(target);
			this.gr = gr;
		}
	},

	getName() {
		return this.gr.getValue('name');
	},

	canRead() {
		return this.gr.canRead();
	},

	tableMetadata(runningScope) {
		var tableScope = this.gr.getValue('sys_scope');
		var isRunningScopeDifferent = tableScope !== runningScope;
		var name = this.getName();
		var hierarchyInfo = this.hierarchyInfo(name);

		var sysId = this.gr.getValue('sys_id');

		return {
			name,
			sysId,
			label: this.gr.getDisplayValue('label'),
			scopeName: this.gr.getDisplayValue('sys_scope'),
			scopeId: tableScope,
			isRunningScopeDifferent,
			isBaseClass: hierarchyInfo.isBaseClass,
			isSoloClass: hierarchyInfo.isSoloClass,
		};
	},

	isValidRecord() {
		return this.gr.isValidRecord();
	},

	hierarchyInfo(name) {
		var gth = new GlideTableHierarchy(name);
		return {
			isBaseClass: gth.isBaseClass(),
			isSoloClass: gth.isSoloClass(),
		};
	},

	type: 'TableDBObject',
};
