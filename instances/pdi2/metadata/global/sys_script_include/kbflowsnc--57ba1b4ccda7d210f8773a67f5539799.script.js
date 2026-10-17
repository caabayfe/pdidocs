var KBFlowSNC = Class.create();
KBFlowSNC.prototype = {
    initialize: function() {
		this.SC_CAT_ITEM_MANAGE_KNOWLEDGE_OWNERSHIP_GROUP ='00766c3c67271300dbfdbb2d07415ae8';
		this.WF_KNOWLEDGE_APPROVAL_OWNERSHIP_GROUP = '5ba2a9f467231300dbfdbb2d07415ac9';
		this.FLOW_KNOWLEDGE_APPROVAL_OWNERSHIP_GROUP = '78b61ce183931210730e5b43c22bc074';
		this.KNOWLEDGE_MANAGEMENT = 'knowledge_management';
	},

    /**
     * Disables the OOB workflow version.
     * @param String sys_id of the workflow version to be disabled.
     */
    disableOOBWorkflow: function(workflowVersion) {
        const workflowVersionGR = new GlideRecordSecure('wf_workflow_version');
        workflowVersionGR.addEncodedQuery('active=true^published=true');
        workflowVersionGR.addQuery('sys_id', workflowVersion);
        workflowVersionGR.query();
        if (workflowVersionGR.next()) {
            workflowVersionGR.active = false;
            workflowVersionGR.update();
        }
        else {
            gs.log('KBFlowSNC: disableOOBWorkflow : No matching workflow version found for workflow with sys_id : ' +workflowVersion);
        }
    },

    /**
     * Unlinks the workflow(Knowledge - Approval Ownership Group) from catalog item (Manage Knowledge Ownership Group)
     * Links flow (Knowledge - Approval Ownership Group) to the same catalog item.
     */
    linkFlowToCatalog: function() {
        const catalogGR = new GlideRecordSecure('sc_cat_item');
        const query = 'sys_id='+this.SC_CAT_ITEM_MANAGE_KNOWLEDGE_OWNERSHIP_GROUP+'^workflow='+this.WF_KNOWLEDGE_APPROVAL_OWNERSHIP_GROUP;
        catalogGR.addEncodedQuery(query);
        catalogGR.query();
        if (catalogGR.next()) {
            catalogGR.workflow = '';
            catalogGR.flow_designer_flow = this.FLOW_KNOWLEDGE_APPROVAL_OWNERSHIP_GROUP;
            catalogGR.update();
        } else {
            gs.log('KBFlowSNC: linkFlowToCatalog No matching catalog item found.');
        }
    },

     /**
     * Disables OOB flow.
     * @param String sys_id of the flow to be disabled.
     */
    disableOOBFlow: function(flowSysId) {
        const flowGR = new GlideRecordSecure('sys_hub_flow');
        if (flowGR.get(flowSysId)) {
            flowGR.active = false;
            flowGR.update();
        } 
        else {
            gs.log('KBFlowSNC: disableOOBFlow: No matching record found with sys_id : '+flowSysId );
        }
    },

    /**
     * Starts the flow associated to the knowledge_base.
     *
     * @param flowField the field used to find the publish/ retire flow
     * @param GlideRecord kb_knowledge record that has been sent for publish/retire
     * @return Boolean true if operation was successful
     */
    startFlow: function(knowledgeGR, flowField) {
        var kbCommon = new global.KBCommon();
        var flowId = kbCommon._getDotField(knowledgeGR, "kb_knowledge_base." + flowField);
        if (JSUtil.nil(flowId))
            return false;
        var flowName = this.getFlowName(flowId);
        if (JSUtil.nil(flowName))
            return false;
        try {
            sn_flow_trigger.FlowTriggerAPI.fireKnowledgeTrigger(flowName, knowledgeGR);
            return true;
        } catch (err) {
            gs.error("KBFlowSNC:startFlow failed with error: " + JSON.stringify(err));
        }
    },

     /**
      * Get the flow name for the knowledge_base.
      * @param String  sys_id of the flow
      * @return String flowName
      */
     getFlowName: function(flowId) {
         var flowName = '';
         var flowGR = new GlideRecord('sys_hub_flow');
         if (flowGR.get(flowId))
             flowName = flowGR.sys_scope.scope + "." + flowGR.internal_name;
         return flowName;
     },

    /**
     * Get flows created using "Knowledge Management" trigger
     * @return String sys_ids of knowledge flows
     */
    getKnowledgeFlows: function() {
        var flows = new global.FlowFiltersSNC().getFlowsByTriggerType(this.KNOWLEDGE_MANAGEMENT);
        var OUTDATE_FLOW_SYS_ID = '6a151635c416f610f8775e5cc901a819';

        flows = flows.filter(function(flowSysId) {
            return flowSysId !== OUTDATE_FLOW_SYS_ID;
        });
        var knowledgeFlows = "sys_idIN" + flows.join(",");
        return knowledgeFlows;
    },

    /**
     * Checks if an active flow context exists for the given knowledge record.
     *
     * @param GlideRecord knowledgeGR - The knowledge record to check for active flow context.
     * @return GlideRecord|Boolean - Returns the active flow context GlideRecord if found, otherwise false.
     */
    checkIfActiveFlowContextExists: function(knowledgeGR) {
        var flowContextGR = new GlideRecord("sys_flow_context");
        flowContextGR.addQuery("state", "WAITING");
        flowContextGR.addQuery("source_record", knowledgeGR.getUniqueValue());
        flowContextGR.setLimit(1);
        flowContextGR.query();

        if (flowContextGR.next()) {
            return flowContextGR;
        }
        return false;
    },

    /**
     * Cancels approval records associated with the given knowledge record.
     *
     * @param GlideRecord knowledgeGR - The knowledge record whose approvals need to be canceled.
     */
    cancelApprovals: function(knowledgeGR) {
        var approvalGR = new GlideRecord("sysapproval_approver");
        approvalGR.addQuery("document_id", knowledgeGR.getUniqueValue());
        approvalGR.addQuery("state", "requested");
        approvalGR.query();
        approvalGR.state = 'cancelled';
        approvalGR.updateMultiple();
    },

	type: 'KBFlowSNC'
};
