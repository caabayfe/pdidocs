var ProblemTaskModel = Class.create();
ProblemTaskModel.prototype = Object.extendsObject(ProblemTaskModelSNC, {

    initialize: function(modelGr, _gs) {
		ProblemTaskModelSNC.prototype.initialize.call(this, modelGr, _gs);
    },

    type: 'ProblemTaskModel'
});

ProblemTaskModel.getMappedModelRecord = ProblemTaskModelSNC.getMappedModelRecord;
ProblemTaskModel.getProblemTaskTypeChoices = ProblemTaskModelSNC.getProblemTaskTypeChoices;
ProblemTaskModel.getDefaultModelValue = ProblemTaskModelSNC.getDefaultModelValue;
ProblemTaskModel.getRefQualForParent = ProblemTaskModelSNC.getRefQualForParent;
