var ProblemTask = Class.create();
ProblemTask.prototype = Object.extendsObject(ProblemTaskSNC, {
    initialize: function(problemTaskGr) {
		ProblemTaskSNC.prototype.initialize.call(this, problemTaskGr);
    },

    type: 'ProblemTask'
});

ProblemTask.USE_MODEL = ProblemTaskSNC.USE_MODEL;
