var AuthPolicyDecisionTableAPI = Class.create();
AuthPolicyDecisionTableAPI.prototype = {
    initialize: function(decisionTableSysId) {
		this.decisionTableSysId = decisionTableSysId;
		this.dt = new sn_dt.CachedDecisionTableAPI();
    },
    
	isEmptyDecisionTable: function(){
		return this.dt.isEmptyDecisionTable(this.decisionTableSysId);
	},
	
	executeDecisionTable: function(input) {
		// DEF0517589: changing the Decision table API from getDecisions to evaluateDecisionQuestions that skips isValid check on sys_auth_policy_answer
		// to avoid repetitive DB calls during the pre-auth policy evaluation
        var response = this.dt.evaluateDecisionQuestions(this.decisionTableSysId, input, false);
        if(!response) 
			return false;
		return true;
    },

    executeDecisionTableQuestionCondition: function(input, condition) {
        var response = this.dt.executeCondition(this.decisionTableSysId, input, condition);
        if (!response)
            return false;
        return true;
    },

    executeAllDecisionTableQuestions: function(input) {
		var answer = new Packages.java.util.HashMap();
		answer = this.dt.executeDecisions(this.decisionTableSysId, input);
        return answer;
    },

    type: 'AuthPolicyDecisionTableAPI'
};
