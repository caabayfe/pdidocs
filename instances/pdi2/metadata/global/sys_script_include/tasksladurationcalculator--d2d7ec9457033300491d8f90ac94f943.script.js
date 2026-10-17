var TaskSLADurationCalculator = Class.create();
TaskSLADurationCalculator.prototype = Object.extendsObject(TaskSLADurationCalculatorSNC, {
    initialize: function(taskSLAGr, slaDurationMs) {
		TaskSLADurationCalculatorSNC.prototype.initialize.call(this, taskSLAGr, slaDurationMs);
	},

    type: 'TaskSLADurationCalculator'
});
