(function executeRule(current, previous /*null when async*/ ) {
    var laneId = current.lane;
    var deletedOrder = current.order;
    var processDefinition = current.process_definition;
    var gr = new GlideRecord(PDConstants.TABLES.PD_LANE);
    var laneExist = gr.get(laneId);
    if (laneExist) {
        PDUtils.cleanUpOrderOnDelete({
            laneId: laneId,
            deletedOrder: deletedOrder,
            itemType: PDConstants.FIELDS.ACTIVITY,
            processDefinition: processDefinition
        });
    }
})(current, previous);
