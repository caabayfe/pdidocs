var FlowRecords = Class.create();

FlowRecords.prototype = {
	/**
	 * @param {string} - tableName on records exists
	 */
	initialize(options) {
		this.tableName = (options && options.tableName) || '';
		this.sortQuery = (options && options.sortQuery) || '';
		this.query = (options && options.query) || '';
	},

	/**
	 */
	getRecordDetails() {
		var rows = [];
		var triggerTypes = [
			'record_create_or_update',
			'record_create',
			'record_update',
			//'record_delete',
		];
		// Get all the flow sys_ids that are associated with the table and their trigger type using api method getFlows provided by workflow team
		var flowTriggerArray = JSON.parse(
			sn_flow.AssociatedFlows.getFlowsWithTriggerDetails(this.tableName)
		);
		var flowIdTriggerMap = flowTriggerArray.reduce(
			(obj, item) =>
				Object.assign(obj, {
					[item.flowId]: item.triggerType,
				}),
			{}
		);
		var flowSysIds = Object.keys(flowIdTriggerMap);
		var query = TBUtil.applySortQuery(this.query, this.sortQuery);
		var flows = FlowQueries.getFlowDataOfTable(flowSysIds, query);
		var canCreate = flows.canCreate();

		while (flows.next()) {
			var flowDetail = this._getFlowDetail(flows, flowIdTriggerMap);
			rows.push(flowDetail);
		}

		return {
			rows,
			canCreate,
		};
	},

	_getFlowDetail(obj, flowIdTriggerMap) {
		var sysId = obj.getValue('sys_id');
		return {
			sysId,
			name: obj.getDisplayValue('name'),
			active: !!JSON.parse(obj.getValue('active')),
			triggerType: flowIdTriggerMap[sysId],
			status: obj.getDisplayValue('status'),
			updated: obj.getDisplayValue('sys_updated_on'),
			updatedBy: this._getUserDisplayName(
				obj.getDisplayValue('sys_updated_by')
			),
			canDelete: obj.canDelete(),
			canWrite: obj.canWrite(),
		};
	},

	_getUserDisplayName(userName) {
		var users = new GlideRecord('sys_user');
		users.addQuery('user_name', userName);
		users.query();
		if (users.next()) {
			return users.getDisplayValue('name');
		}
	},

	type: 'FlowRecords',
};
