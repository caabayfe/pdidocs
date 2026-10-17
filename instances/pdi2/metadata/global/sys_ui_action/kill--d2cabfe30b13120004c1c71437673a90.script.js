if (current.uncancelable) {
	gs.addErrorMessage(gs.getMessage('This system transaction is designated as uncancelable. To kill it, you must force kill it by entering the record.'));
} else {
	currentNodeId = GlideClusterSynchronizer.getSystemID();
	if (current.node_id == currentNodeId) {
		GlideTransactionManager.kill(current.session_id);
	} else {
		var cancelScript = "GlideTransactionManager.kill('" + current.session_id + "');";
		GlideClusterMessage.postScript(cancelScript, current.node_id);
	}
	gs.addInfoMessage(gs.getMessage('Kill message sent to user transaction {0} against {1} in node {2}',[current.user,current.url,current.node_id]));
	gs.addInfoMessage(gs.getMessage('Transaction may not terminate immediately. <a href="loading_transactions.do">Refresh</a>'));
}
