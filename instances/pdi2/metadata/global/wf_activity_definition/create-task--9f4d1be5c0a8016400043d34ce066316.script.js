/**
 * Workflow activity used to create and manage tasks
 */
var Create_TaskActivityHandler = Class.create();

Create_TaskActivityHandler.prototype = Object.extendsObject(WFCreateTaskActivityUtils, {
    
    initialize: function() {
        WFCreateTaskActivityUtils.prototype.initialize.call(this);
    },
    
    onExecute: function() {
        var taskID = this.execute(activity);

        this._removeGenerateObj(activity.activity.toString());
        activity.scratchpad.taskID = taskID;
        
        // Do we want to wait on the task?
        if (activity.vars.wait_for_completion)
            executing.state = 'waiting';

        this.autoClose(taskID);
    },
    
    // will evaluate task after insert in case
    // logic in advanced scripting has closed the current task
    // and set the executing state to finished so the Activity Manager will
    // move the workflow along.
    autoClose: function(taskID) {
        var gr = new GlideRecord('task');
        if (!taskID || !gr.get(taskID)) {
            executing.state = 'finished';
            executing.result = 'deleted';
        } else if (!gr.active) {
            executing.state = 'finished';
            executing.result = gr.state;
        }
    },
    
    // The task has changed, see if the task is done
    onUpdate: function() {
        // check for completion
        var gr = new GlideRecord('task');
        if (!gr.get(activity.scratchpad.taskID)) {
            executing.state = 'finished';
            executing.result = 'deleted';
            return;
        }
        
        if (!gr.active) {
            executing.state = 'finished';
            executing.result = gr.state;
        }
    },
    
    onCancel: function() {
		this._setTaskState(activity.scratchpad.taskID, '4'); // mark task as Closed Incomplete
        executing.state = 'cancelled';
        executing.result = 'cancelled';
    },
    
    /**
     * Create the task as a forward-looking process in which we just create, but do
     * not process the task. This allows the task to be generated up front before
     * the workflow runs such that the task is visible prior to being active (ie,
     * open).
     */
    _generate: function(order, startAt, noCreateFlag) {
        var id = this._createTask('-5', order, startAt, noCreateFlag);
        var genObj = {};
        genObj.taskID = id;
        genObj.duration = this.duration;
        return genObj;
    },

    type: 'Create_TaskActivityHandler'
});
