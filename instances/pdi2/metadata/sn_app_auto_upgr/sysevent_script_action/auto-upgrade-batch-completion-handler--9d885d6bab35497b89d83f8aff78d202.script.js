try {
	var params     = JSON.parse(String(event.parm1 || '{}'));
	var batchPlanId = String(params.batch_plan_id || '');
	gs.info('[AutoUpgrade] batch.operation.update fired: batch_plan_id=' + batchPlanId + ', status=' + params.status);
	new sn_app_auto_upgr.SnAutoUpgradeBatchCompletionHandler().handleBatchCompletion(batchPlanId);
} catch (e) {
	gs.error('[AutoUpgrade] batch.operation.update handler failed: ' + e.message);
}
