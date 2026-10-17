var KBWorkflowSNC = Class.create();

KBWorkflowSNC.prototype = Object.extendsObject(KBCommon, {
    initialize: function() {
    },

	/**
	 * Updates the workflow_state of a kb_knowledge according to the passed state.
	 *
	 * @param GlideRecord kb_knowledge record that requires state change
	 * @param String the record status should be updated to this value
	 * @return Boolean success if kb_knowledge state is progressed
	 */
	progressStatus: function(kbKnowledgeGR, state) {
		kbKnowledgeGR.setValue("workflow_state", state);
		if (state == "published" || state == "retired")
			kbKnowledgeGR.setValue(state, new GlideDate());
		return true;
	},

	/**
     * Publishes the kb_knowledge record
	 *
	 * @param GlideRecord kb_knowledge record that is published
	 * @return Boolean True if kb_knowledge updated successfully
     */
    publishKnowledge: function(kbKnowledgeGR) {
        kbKnowledgeGR.workflow_state = "published";
		kbKnowledgeGR.retired = "";
		kbKnowledgeGR.published = new GlideDate();
		return true;
    },

	/**
     * Outdates the previous kb_knowledge record
	 *
	 * @param GlideRecord kb_knowledge record that is outdated
	 * @return Boolean True if kb_knowledge updated successfully
     */
    outdateKnowledge: function(kbKnowledgeGR) {
        kbKnowledgeGR.workflow_state = "outdated";
		return true;
    },
	
    /**
     * Cancels any approvals associated with the kb_knowledge and reverts
     * to the record's previous state.
     *      
     * @param GlideRecord kb_knowledge
     * @return successful update operation
     */
    cancelApproval: function(knowledgeGR) {
        var mapState = {review: "draft", pending_retirement: "published"};
        var CANCEL_FLOW_REASON = "Canceling Knowledge Flow when Knowledge Base changes";
        if (this.checkIfActiveWorkflowContextExists(knowledgeGR)) {
            new Workflow().cancel(knowledgeGR, knowledgeGR.getTableName());
        } else {
            var kbFlowAPI = new global.KBFlow();
            var flowContext = kbFlowAPI.checkIfActiveFlowContextExists(knowledgeGR);
            if (flowContext) {
                sn_fd.FlowAPI.cancel(flowContext.getUniqueValue(), CANCEL_FLOW_REASON);
                kbFlowAPI.cancelApprovals(knowledgeGR);
            }
        }

        this.progressStatus(knowledgeGR, mapState[knowledgeGR.workflow_state + ""]);
        // state needs to be persisted for flow
        return knowledgeGR.update();
    },
	
	/**
     * Retires the kb_knowledge record
	 *
	 * @param GlideRecord kb_knowledge record that is retired
	 * @return Boolean True if kb_knowledge updated successfully
     */
	retireKnowledge: function(knowledgeGR) {
		// Case 1: Ensure the parent kb_knowledge record can be found
		if (!knowledgeGR.isValid())
			return false;
		
		// Default: Set the kb_knowledge record to a state of retired
        knowledgeGR.workflow_state = "retired";
		knowledgeGR.retired = new GlideDate();
		knowledgeGR.update();
		return true;
	},
	
	/**
     * Starts the workflow associated to the knowled_base.
     *
	 * @param workflowField the field used to find the publish/ retire workflow
     * @param GlideRecord kb_knowledge record that has been sent for publish
     * @return Boolean true if operation was successful
     */
    startWorkflow: function(knowledgeGR, workflowField) {
        var workflowId = this._getDotField(knowledgeGR, "kb_knowledge_base." + workflowField);
        if (JSUtil.nil(workflowId))
            return false;
        var initial_workflow_state = knowledgeGR.workflow_state;
        var context = new Workflow().startFlow(workflowId, knowledgeGR, knowledgeGR.operation(), {initial_workflow_state:initial_workflow_state});
        if (JSUtil.nil(context))
            return false;
        
        return true;
    },

    /**
     * Gets a list of managers and the owner from the associated Knowledge Base, 
     * which will be used as approvers for the kb_knowledge.
     *
     * Check for users in ownership group, if exists, return list of users.
	 * otherwise, Check for Owner and managers.
     *
     * @param GlideRecord kb_knowledge that is going through approval
     * @return String comma seperated list of user_ids
     */
    getApprovers: function(knowledgeGR) {
        if (this.isVersioningInstalled() && gs.getProperty("glide.knowman.ownership_group.enabled",'false') +'' == 'true') {
            var users = new KBOwnershipGroup().getOwnershipGroupMembers(knowledgeGR);
            if (gs.getProperty("glide.knowman.ownership_group.allow_self_approval", 'true') == 'false') {
                var author = (knowledgeGR.revised_by && knowledgeGR.revised_by != '') ? knowledgeGR.getValue("revised_by") : knowledgeGR.getValue("author");
                if (users.indexOf(author) != -1)
                    users.splice(users.indexOf(author), 1);
            }
            if (users.length > 0) {
                users = this._filterInactiveUsers(users.toString());
                if (!gs.nil(users))
                    return users;
            }
        }
        var kbOwner = knowledgeGR.kb_knowledge_base.owner;
        var kbManagers = knowledgeGR.kb_knowledge_base.kb_managers;
        var approvers = '';
        if (kbOwner.active) {
            //Approval activity will handle any trailing comma, if there are no managers.
            approvers = kbOwner + ",";
        }
        approvers = approvers + this._filterInactiveUsers(kbManagers);
        return approvers;
    },
    /*
     * Internal function used to fetch invalid users and remove them from user list.
     *
     * @param users- comma seperated list of user_ids
     * @return String-comma seperated list of user_ids
     */
    _filterInactiveUsers: function(users) {
        if (gs.nil(users)) {
            return '';
        }
        //Fetch for inactive users.
        var inactiveUsers = new GlideRecord('sys_user');
        inactiveUsers.addQuery("active", "false");
        inactiveUsers.addQuery('sys_id', 'IN', users);
        inactiveUsers.query();
		//Check for any inactiveusers.
        if (inactiveUsers.hasNext()) {
            var userArray = users.split(",");
            while (inactiveUsers.next()) {
                var useridx = userArray.indexOf(inactiveUsers.getUniqueValue()+'');
                if (useridx != -1)
                    userArray.splice(useridx, 1);
            }
            users = userArray.toString();
        }
        return users;
    },

    /**
     * Gets a list of workflows that can be applied to the kb_knowledge table.
     * 
     * @return Array of wf_workflow ids
     */
    getWorkflowIds: function() {
        var arrWorkflowIds = [];

        var gr = new GlideRecord("wf_workflow_version");
        gr.addActiveQuery();
        gr.addQuery("published", "true");
        gr.addQuery("table", "kb_knowledge");
        gr.query();

        while (gr.next())
            arrWorkflowIds.push(gr.workflow.sys_id + "");

        return arrWorkflowIds;
    },

    /**
     * Checks if there is an active workflow context for the given knowledge record.
     *
     * @param GlideRecord knowledgeGR - The knowledge record to check for active workflow context.
     * @return Boolean - True if an active workflow context exists, otherwise false.
     */
    checkIfActiveWorkflowContextExists: function(knowledgeGR) {
        var workflowContextGR = new GlideRecord('wf_context');
        workflowContextGR.addActiveQuery();
        workflowContextGR.addQuery("id", knowledgeGR.getUniqueValue());
        workflowContextGR.setLimit(1);
        workflowContextGR.query();
        return workflowContextGR.hasNext();
    },

    type: 'KBWorkflowSNC'
});
