var ProblemTaskSNC = Class.create();

ProblemTaskSNC.USE_MODEL = gs.getProperty("com.snc.problem_management.models.enabled", "false") === "true";

ProblemTaskSNC.prototype = {

    STATE: "state",

    LOG_PROPERTY: "com.snc.problem.core.log",
    initialize: function(problemTaskGr) {
        this._log = new GSLog(this.LOG_PROPERTY, this.type);
        this._gr = problemTaskGr;
        this._useModel = ProblemTaskSNC.USE_MODEL;
        this._model = new ProblemTaskModel(this._gr.prb_task_model.getRefRecord());

        this.plugin = {
            "problem_management": pm.isActive("com.snc.problem"),
            "state_model": pm.isActive("com.snc.best_practice.problem.madrid.state_model"),
            "problem_model": pm.isActive("com.snc.problem.problem_model"),
        };

        // Used to checks if the gr has been navigated without instanciating a new object
        this._idChk = null;
    },

    getStateFieldName: function() {
        if (this._useModel)
            return this._model.getStateFieldName();
        return this.STATE;
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

    // Returns a list of manual transition states available for the Problem Task's current state
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

    type: "ProblemTaskSNC"
};
