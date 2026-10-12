var NAAAgentConfigInterface = Class.create();
NAAAgentConfigInterface.prototype = {
    initialize: function() {},

    /**
     * input : object contains agentTable and agentSysId
     * return true if extension instance should process the agentic entity, else false
     */
    shouldProcess: function(input) {
        return input.agentTable == NAAConstant.SKILL_CONFIG;
    },

    /**
     * input : object contains agentTable and agentSysId
     * return true if the agentic entity is helper, else false
     */
    isHelperType: function(input) {
        var gr = new GlideRecord(NAAConstant.SKILL_CONFIG);
        return input.agentTable == NAAConstant.SKILL_CONFIG && gr.get(input.agentSysId);
    },

    type: 'NAAAgentConfigInterface'
};
