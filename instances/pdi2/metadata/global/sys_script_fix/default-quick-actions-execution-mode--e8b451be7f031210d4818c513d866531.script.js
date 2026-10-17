updateQuickActionsExecutionMode();

		function updateQuickActionsExecutionMode() {
			var quickActions = new GlideRecord("quickactions_action");
			quickActions.addNullQuery("execution_mode");
			quickActions.setWorkflow(false);
			quickActions.setValue("execution_mode", "server");
			quickActions.updateMultiple();
			gs.info("Defaulted existing quick actions record(s) execution mode.");
		}
