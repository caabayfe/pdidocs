var Problem = Class.create();
Problem.prototype = Object.extendsObject(ProblemSNC, {
    initialize: function(problemGr) {
		ProblemSNC.prototype.initialize.call(this, problemGr);
    },

    type: 'Problem'
});

Problem.USE_MODEL = ProblemSNC.USE_MODEL;
