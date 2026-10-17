var CatalogRequestUtil = Class.create();
CatalogRequestUtil.prototype = {
    initialize: function(requestGr) {
		this.requestGr = requestGr;
	},

    cascadeRequestApproval: function() {
        if (!this.requestGr || !this.requestGr.isValidRecord())
            return;
        var gr = new GlideRecord("sc_req_item");
        gr.addQuery("request", this.requestGr.getUniqueValue());
        gr.query();

        while (gr.next()) {
            if (this.isPendingSequencedReqItem(gr))
				this.changeStageToNotStarted(gr);
			else
				this.cascadeApprovalToReqItem(gr, false);
        }
    },
	
	changeStageToNotStarted: function(reqItemGr) {
		if (this.requestGr.approval == "approved"){
			reqItemGr.setValue("stage", "not_started");
			reqItemGr.update();
		}
	},

    cascadeApprovalForSequencedReqItem: function(reqItemGr) {
        if (!reqItemGr || !reqItemGr.isValidRecord())
            return;
        this.cascadeApprovalToReqItem(reqItemGr, true);

    },

    cascadeApprovalToReqItem: function(gr, pendingReqItem) {
        // We handle this differently for delivery plans vs. workflows
        if (this.hasWorkflow(gr))
            this.cascadeRequestApprovalWorkflow(gr, pendingReqItem);
        else if (this.hasFlowDesigner(gr))
            this.cascadeRequestApprovalFlowDesigner(gr, pendingReqItem);
        else
            this.cascadeRequestApprovalDeliveryPlan(gr, pendingReqItem);
        gr.update();
    },

    /**
     * Cascade the request approval to the request item:
     *
     *   approved -> if item is waiting for approval, get first stage of the delivery plan
     *   rejected -> mark item as Request Cancelled
     */
    cascadeRequestApprovalDeliveryPlan: function(gr, pendingReqItem) {
        if (gr.cat_item.delivery_plan.nil())
            return;

        gr.approval = this.requestGr.approval;
        if ((gr.stage == "waiting_for_approval" || pendingReqItem) && this.requestGr.approval == "approved") {
            gr.stage = this.getNextStage(gr);
			if (pendingReqItem)
				gr.state = 1;
		}
        else if (this.requestGr.approval == 'rejected') {
            gr.stage = 'Request Cancelled';
            gr.state = 4;
        }
    },

    cascadeRequestApprovalWorkflow: function(gr, pendingReqItem) {
        if ((gr.stage == "waiting_for_approval" || pendingReqItem) && this.requestGr.approval == "approved") {
            gr.approval = "requested";
            gr.stage = "request_approved";
            if (pendingReqItem)
                gr.state = 1;
        } else if (this.requestGr.approval == 'rejected') {
            gr.approval = "rejected";
            gr.stage = "Request Cancelled";
            gr.state = 4;
        }
    },

    cascadeRequestApprovalFlowDesigner: function(gr, pendingReqItem) {
        if ((gr.stage == "waiting_for_approval" || pendingReqItem) && this.requestGr.approval == "approved") {
            gr.approval = "requested";
            gr.stage = "request_approved";
            if (pendingReqItem)
                gr.state = 1;
        } else if (this.requestGr.approval == 'rejected') {
            gr.approval = "rejected";
            gr.stage = "Request Cancelled";
            gr.state = 4;
        }
    },

    hasWorkflow: function(gr) {
		var vv = gr.cat_item.workflow && !gr.cat_item.workflow.nil();
        // Check if Catalog Item is using Workflow
        if (gr.cat_item.workflow && !gr.cat_item.workflow.nil())
            return true;

        return false;
    },

    hasFlowDesigner: function(gr) {
        // Check if Catalog Item is using Workflow
        if (gr.cat_item.flow_designer_flow && !gr.cat_item.flow_designer_flow.nil())
            return true;

        return false;
    },

    getNextStage: function(reqitem) {
        // return the first delivery task
        var nextStage = "nothing";
        var planID = GlideappDeliveryPlan.resolvePlanID(reqitem);
        var gr = new GlideRecord("sc_cat_item_delivery_task");
        gr.addQuery("delivery_plan", planID);
        gr.orderBy("order");
        gr.query();
        if (gr.next())
            nextStage = gr.name.getDisplayValue();

        return nextStage;
    },

    isPendingSequencedReqItem: function(gr) {
		if (JSUtil.nil((gr.getValue('order_guide'))))
			return false;
        return JSUtil.notNil(new sn_sc.CatItem(gr.getValue('order_guide')).getSequencingProcess()) 
				&& gr.state == -10 // Not started
				&& gr.stage == "waiting_for_approval"
				&& this.requestGr.approval != 'rejected';
    },

    type: 'CatalogRequestUtil'
};
