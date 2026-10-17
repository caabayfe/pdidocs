var ProblemSNC = Class.create();

ProblemSNC.USE_MODEL = gs.getProperty("com.snc.problem_management.models.enabled", "false") === "true";

ProblemSNC.prototype = {

    STATE: "state",

    LOG_PROPERTY: "com.snc.problem.core.log",

    initialize: function(problemGr) {
        this._log = new GSLog(this.LOG_PROPERTY, this.type);
        this._gr = problemGr;
        this._useModel = ProblemSNC.USE_MODEL;
        this._model = new ProblemModel(this._gr.prb_model.getRefRecord());

        this.plugin = {
            "problem_management": pm.isActive("com.snc.problem"),
            "state_model": pm.isActive("com.snc.best_practice.problem.madrid.state_model"),
            "problem_model": pm.isActive("com.snc.problem.problem_model"),
        };

        // Used to check if the gr has been navigated without instanciating a new object
        this._idChk = null;
    },

    // Returns the value of field configured to hold state for this type/model of Problem
    getState: function() {
        return this._gr.getValue(this.getStateFieldName());
    },

    getStateFieldName: function() {
        if (!this._useModel)
            return this.STATE;
        return this._model.getStateFieldName();
    },

    // Returns the initial state value of the model
    getInitialState: function() {
        var initialState = this._model.getFromCache("initial_state");
        if (initialState !== null)
            return initialState;

        var stateGr = this._model.getInitialState();
        if (!stateGr)
            return null;

        return stateGr.getValue("state_value");
    },

    // Returns true if the provided state value is a valid manual state transition
    isNextManualState: function(stateValue) {
        stateValue = stateValue + "";
        var nextStates = this.getNextManualStates();
        return nextStates.indexOf(stateValue) !== -1;
    },

    getNextManualStates: function() {
        var manualTransitions = this._model.getFromCache("manual_transitions") || {};
        var currentState = this._gr.getValue(this.getStateFieldName());

        if (manualTransitions && manualTransitions[currentState])
            return manualTransitions[currentState];

        var stateValues = [];
        var transitionStateGr = this._model.getManualTransitionStates(this._gr);

        if (!transitionStateGr)
            return stateValues;

        while (transitionStateGr.next())
            stateValues.push(transitionStateGr.getValue("state_value"));

        manualTransitions[currentState] = stateValues;
        this._model.addToCache("manual_transitions", manualTransitions);

        return stateValues;
    },

    type: "ProblemSNC"
};
