current.addQuery('agent_correlator', parent.status);

var parentScratchpad = new Function('return ' + parent.scratchpad)();
var q = null;
if (gs.nil(parentScratchpad.sourceIP)) {
	q = current.addQuery('source', parent.source);
} else {
	if (!gs.nil(parentScratchpad.cimInstance))
		current.addQuery('payload', 'CONTAINS', parentScratchpad.cimInstance);
	
	q = current.addQuery('source', parentScratchpad.sourceIP);
}

var ds = new DiscoveryStatus(parent.status);
if (ds.discover != 'Nets')
	q.addOrCondition("topic", "Shazzam");
