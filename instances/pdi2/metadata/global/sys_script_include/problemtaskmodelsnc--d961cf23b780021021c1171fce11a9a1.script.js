var ProblemTaskModelSNC = Class.create();
ProblemTaskModelSNC.prototype = Object.extendsObject(STTRMModel, {

    initialize: function(modelGr, _gs) {
        STTRMModel.prototype.initialize.call(this, modelGr, _gs);
    },

    // Applies a problem task model to a Problem Task
    applyModel: function(problemTaskGr) {
        problemTaskGr.setValue('prb_task_model', this._gr.getUniqueValue());
        this.applyInitialState(problemTaskGr, problemTaskGr.prb_task_model.changes());
    },

    type: 'ProblemTaskModelSNC'
});

ProblemTaskModelSNC.getMappedModelRecord = function(problemTaskType) {
	var modelGR = new GlideRecord("prb_task_model");
	modelGR.addActiveQuery();
	modelGR.addQuery("prb_task_type", problemTaskType);
	modelGR.orderByDesc("sys_updated_on");
	modelGR.setLimit(1);
	modelGR.query();
	modelGR.next();
	return modelGR;
},

ProblemTaskModelSNC.getProblemTaskTypeChoices = function() {
	var choices = [];
	var choiceGr = new GlideSysChoice("problem_task", "problem_task_type").getChoices();

	while (choiceGr.next()) {
		if (choiceGr.getValue("inactive") === "1")
			continue;

		choices.push({
			"value": choiceGr.getValue("value"),
			"label": choiceGr.getDisplayValue("label"),
			"sequence": choiceGr.getValue("sequence")
		});
	}
	return choices;
};

ProblemTaskModelSNC.getDefaultModelValue = function(problemTaskGr) {
	// If the associated problem exists and doesn't have a model, return early
	var associatedProblem = problemTaskGr.problem;
	if (associatedProblem && associatedProblem.prb_model + '' === '')
		return '';

	var transaction = GlideTransaction.get();

	// If the call is from the Interceptor but it doesn't have sysparm_prb_task_model, then no model
	if (transaction.getRequestParameter('WIZARD:action') && !transaction.getRequestParameter('sysparm_prb_task_model'))
		return '';

	// If the call is from the Interceptor, it should contain a sysparm with the model required
	if (transaction.getRequestParameter('WIZARD:action'))
		return transaction.getRequestParameter('sysparm_prb_task_model');

	// All other cases where the call is not from the Interceptor, it'll depend on the property
	if (ProblemTask.USE_MODEL === false)
		return '';

	// If we have a type then we should try to find the mapped model record
	if (!problemTaskGr.problem_task_type.nil()) {
		var modelGr = ProblemTaskModel.getMappedModelRecord(problemTaskGr.problem_task_type + "");
		if (modelGr && modelGr.isValidRecord())
			return modelGr.getUniqueValue();
	}

    var tableName = problemTaskGr ? problemTaskGr.getTableName() : 'problem_task';
    var problemTaskModelGr = new GlideRecord('prb_task_model');
    problemTaskModelGr.addActiveQuery();
    problemTaskModelGr.addQuery('default_prb_task_model', '1');
    problemTaskModelGr.addQuery('table_name', tableName);
    problemTaskModelGr.setLimit(1);
    problemTaskModelGr.query();
    if (problemTaskModelGr.next())
        return problemTaskModelGr.getUniqueValue();
    return '';
};

ProblemTaskModelSNC.getRefQualForParent = function(problemTaskGr) {
    var refQual = 'active=true^table_name=' + problemTaskGr.problem.getTableName();
    if (problemTaskGr.prb_task_model.nil())
        return refQual + '^prb_modelISEMPTY^EQ';

    return refQual + '^prb_modelISNOTEMPTY^EQ';
};
