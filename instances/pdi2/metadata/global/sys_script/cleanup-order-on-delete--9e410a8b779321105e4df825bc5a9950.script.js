(function executeRule(current, previous /*null when async*/) {
	var laneId = current.sys_id;
	var deletedOrder = current.order;
	var processDefinition = current.process_definition;
	PDUtils.cleanUpOrderOnDelete({
		laneId: laneId,
		deletedOrder: deletedOrder,
		itemType: PDConstants.FIELDS.LANE,
		processDefinition: processDefinition
	});

})(current, previous);
