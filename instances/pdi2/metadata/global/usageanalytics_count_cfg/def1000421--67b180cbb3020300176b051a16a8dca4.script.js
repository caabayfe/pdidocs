// Orchestration Transactions LastMonth
var orchTxLastMonth = 0;
if(GlidePluginManager.isActive('com.snc.runbook_automation.runtime')) {
	orchTxLastMonth = new global.OrchCoreTransactionQuery().getTransactionsCount("sys_created_onONLast month@javascript:gs.beginningOfLastMonth()@javascript:gs.endOfLastMonth()");
	// get SAMP TX and substract SAMP TX 
	var sampCount = new global.SAMPTXCounter().getReclamationTXCountForLastMonth();
	orchTxLastMonth = orchTxLastMonth - sampCount;
} 
// IntegrationHub Transaction LastMonth
var ihTxLastMonth = new OutboundUsageMetricsAggregator().getTransactionCountForLastMonth('sys_hub_step_instance', true);

answer = orchTxLastMonth+ihTxLastMonth;
