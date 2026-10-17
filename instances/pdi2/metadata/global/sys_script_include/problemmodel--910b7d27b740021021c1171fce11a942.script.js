var ProblemModel = Class.create();
ProblemModel.prototype = Object.extendsObject(ProblemModelSNC, {

    initialize: function(modelGr, _gs) {
        ProblemModelSNC.prototype.initialize.call(this, modelGr, _gs);
    },

    type: 'ProblemModel'
});

ProblemModel.getDefaultModelValue = ProblemModelSNC.getDefaultModelValue;
