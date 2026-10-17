var RendererFactory = Class.create();
RendererFactory.prototype = {
    initialize: function() {},
    type: 'RendererFactory'
};

/** 
 * Select renderer for a given table.column ref and row ID
 */
RendererFactory.getRenderer = function(ref, id) {
    if (GlideUtil.isExpressInstance())
        return "express_workflow_renderer";
    if (current.getValue("flow_context"))
        return "FlowDesigner";

    //if we have stage_state record and it specified the Flow Designer renderer, use FlowDesigner's provider
    var stageStateGR = new GlideRecord("stage_state");
    stageStateGR.addQuery("table", current.getTableName());
    stageStateGR.addQuery("id", current.getUniqueValue());
    stageStateGR.addQuery("field", ref.getName());
    stageStateGR.orderByDesc("sys_created_on");
    stageStateGR.setLimit(1);
    stageStateGR.query();
    if (stageStateGR.next() && stageStateGR.getDisplayValue("column_renderer") == "FlowDesigner")
        return "FlowDesigner";

    return new SNC.WorkflowScriptAPI().getRenderer(current);
};

RendererFactory.getSchedule = function(ref, id) {
    var tableName = ref.split('.');
    if (tableName.length != 2)
        return '';

    var grCurrent = new GlideRecord(tableName[0]);
    grCurrent.sys_id = id;

    var ctx = new Workflow().getRunningFlows(grCurrent, tableName[0]);

    if (!ctx.next())
        return '';

    var schedule = ctx.workflow_version.schedule + '';
    return schedule ? schedule : '';
};
