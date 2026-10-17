// Workflow activity definition handler class
//
// Implement activity definition handling in the onExecute method
//
// Implement any event handlers for the activity definition as a method named 'on[event_name]'
//     For example, to handle the 'cancel' event, implement an 'onCancel' method
//

var Scriptable_Order_GuideActivityHandler = Class.create();
Scriptable_Order_GuideActivityHandler.prototype = Object.extendsObject(WFActivityHandler, {
    WAITING: "waiting",
    FINISHED: "finished",
    SUCCESS: "success",
    FAILURE: "failure",
    EMPTY_JSON: "{}",

    initialize: function() {
        WFActivityHandler.prototype.initialize.call(this);
        this._log = new GSLog(sc_.LOG_LEVEL, this.type).setLog4J();
    },

    onExecute: function() {
        var orderGuideId = activity.vars.order_guide_id + "";
        var json = this._getJSON();
        this._log.debug("[onExecute] JSON: " + json);

        var sog = new SNC.ScriptableOrderGuide(orderGuideId, current.getTableName(), current.sys_id + "", activity.activity + "");
        var result = sog.process(json);

        this._processResult(result, sog);
    },

    onReprocess: function() {
        var failure = this._getFailureRecord(current);
        if (!failure) {
            this._log.debug("[onReprocess] This is not the activity you are looking for!");
            return;
        }

        this._log.debug("[onReprocess] Reprocessing activity");
        var sog = new SNC.ScriptableOrderGuide(failure.order_guide + "", current.getTableName(), current.sys_id + "", activity.activity + "");
        var result = sog.reprocess(failure);

        this._processResult(result, sog);
    },

    onDelete: function() {
        activity.state = this.FINISHED;
        activity.result = this.FAILURE;
        
        this._log.debug("[onDelete] setting activity.result = " + activity.result);
        this._log.debug("[onDelete] setting activity.state = " + activity.state);
    },

    _processResult: function(result, sog) {
        this._log.debug("[_processResult] Result = " + result);
        
        if (result) {
            if (sog.getRequest() != null)
                workflow.scratchpad.sc_request = sog.getRequest().sys_id + "";

            activity.state = this.FINISHED;
            activity.result = this.SUCCESS;
            this._log.debug("[_processResult] setting activity.result = " + activity.result);
        } else
            activity.state = this.WAITING;

        this._log.debug("[_processResult] setting activity.state = " + activity.state);
    },

    _getFailureRecord: function(sourceGR) {
        var gr = new GlideRecord(sc_.SCRIPTABLE_ORDER_GUIDE_FAILURE);
        gr.addQuery("source_table", sourceGR.getTableName());
        gr.addQuery("source_document", sourceGR.sys_id);
        gr.addQuery("wf_activity", activity.activity);
        gr.query();
        if (gr.next()) {
            this._log.debug("[_getFailureRecord] Failure record found");
            return gr;
        }

        this._log.debug("[_getFailureRecord] Failure record not found");
        return null;
    },

    _getJSON: function() {
        var script = activity.vars.script + "";
        if (!script)
            return this.EMPTY_JSON;

        var answer = this.runScript(script);
        if (!answer)
            return this.EMPTY_JSON;

        return answer;
    },

    type: "Scriptable_Order_GuideActivityHandler"
});
