var ProblemStateUtils = Class.create();
ProblemStateUtils.prototype = Object.extendsObject(ProblemStateUtilsSNC, {
    initialize: function(argument) {
		ProblemStateUtilsSNC.prototype.initialize.call(this, argument);
    },

    type: 'ProblemStateUtils'
});

ProblemTaskStateUtils.USE_MODEL = ProblemTaskStateUtilsSNC.USE_MODEL;
