(function () {
	new SNC.QueueProcessingHandler().processMessage(current.agent, current.payload);
})();
current.state = 'processed';
current.processed = gs.nowDateTime();
