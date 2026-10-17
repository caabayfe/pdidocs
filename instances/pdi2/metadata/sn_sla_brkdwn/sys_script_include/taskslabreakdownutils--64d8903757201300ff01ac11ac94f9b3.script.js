var TaskSLABreakdownUtils = Class.create();
TaskSLABreakdownUtils.prototype = Object.extendsObject(TaskSLABreakdownUtilsSNC, {
    initialize: function(taskSLAGr) {
		TaskSLABreakdownUtilsSNC.prototype.initialize.call(this, taskSLAGr);		
    },

    type: 'TaskSLABreakdownUtils'
});
