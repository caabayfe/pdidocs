var ProblemModelSNC = Class.create();
ProblemModelSNC.prototype = Object.extendsObject(STTRMModel, {

    initialize: function(modelGr, _gs) {
        STTRMModel.prototype.initialize.call(this, modelGr, _gs);
    },

    // Applies a problem model to a Problem
    applyModel: function(problemGr) {
        problemGr.setValue('prb_model', this._gr.getUniqueValue());
        this.applyInitialState(problemGr, problemGr.prb_model.changes());
    },

    type: 'ProblemModelSNC'
});

ProblemModelSNC.getDefaultModelValue = function(problemGr) {
    if (Problem.USE_MODEL === false)
        return '';

    var tableName = problemGr ? problemGr.getTableName() : 'problem';
    var prbModelGr = new GlideRecord('prb_model');
    prbModelGr.addActiveQuery();
    prbModelGr.addQuery('default_prb_model', '1');
    prbModelGr.addQuery('table_name', tableName);
    prbModelGr.setLimit(1);
    prbModelGr.query();
    if (prbModelGr.next())
        return prbModelGr.getUniqueValue();
    return '';
};
