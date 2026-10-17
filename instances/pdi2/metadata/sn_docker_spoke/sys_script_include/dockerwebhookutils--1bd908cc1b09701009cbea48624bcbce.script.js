var DockerWebhookUtils = Class.create();
DockerWebhookUtils.prototype = {
    initialize: function() {},  

    getDecisionsubFlow: function(decisions) {
        gs.info("decision output =" + decisions.getValue("subflow"));
        var gr = new GlideRecord("sys_hub_flow");
        gr.get(decisions.getValue("subflow"));
        gr.next();

        var subFlowInternalName;
        subFlowInternalName = gr.getValue('internal_name');
        return subFlowInternalName;
    },

    subflowExecutionEvent: function(subFlowInputs, subFlowInternalName) {
        var subFlowName = 'sn_docker_spoke' + '.' + subFlowInternalName;
        gs.info("Docker Webhook Subflow executed = " + subFlowName);
        sn_fd.FlowAPI.startSubflow(subFlowName, subFlowInputs);
        return;
    },

    type: 'DockerWebhookUtils'
};
