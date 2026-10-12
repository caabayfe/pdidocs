var RestartFlow = Class.create();

RestartFlow.prototype = Object.extendsObject(AbstractAjaxProcessor, {
    restartFlow: function() {
		var contextId = this.getParameter('sysparm_sys_id');
			try {
				sn_fd.FlowAPI.getRunner().restartFlowFromContext(contextId, null);
				gs.addInfoMessage(gs.getMessage("The flow has been restarted successfully."));
			} catch (ex) {
				var defaultMsg = gs.getMessage("An unknown error occurred restarting the flow.");
				var message = ex.getMessage() || defaultMsg;
				gs.addErrorMessage(message);
				gs.error(message);
			}
	},

});
