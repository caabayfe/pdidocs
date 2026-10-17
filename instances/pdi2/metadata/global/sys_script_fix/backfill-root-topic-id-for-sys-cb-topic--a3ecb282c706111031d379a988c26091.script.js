var cbTopicMap = {};
var fields = ['sys_id', 'source_topic_id', 'root_topic_id'];
var gr = new GlideRecord('sys_cb_topic');
gr.query();
while (gr.next()) {
	var fieldValues = {};
	for (var i = 0; i < fields.length; ++i) {
		fieldValues[fields[i]] = gr.getValue(fields[i]);
	}
	cbTopicMap[gr.getValue('sys_id')] = fieldValues;
}

function findRoot(sysId, visitedIds) {
	var sourceId = cbTopicMap[sysId].source_topic_id;
	var sourceTopic = cbTopicMap[sourceId];	
	if (!sourceId || sourceTopic.source_topic_id in visitedIds) {
		return 'root not found';
	} 
	if (!sourceTopic.source_topic_id) {
		return sourceId;
	}
	visitedIds[sourceId] = true;
	return findRoot(sourceId, visitedIds);
}

function backFillRootTopicId() {
	var gr = new GlideRecord('sys_cb_topic');
	gr.addEncodedQuery('root_topic_idISEMPTY^source_topic_idISNOTEMPTY');
	gr.query();
	while (gr.next()) {
		var root = findRoot(gr.getValue('sys_id'), {});
		if (root !== 'root not found') {
			gr.setValue('root_topic_id', root);
			gr.autoSysFields(false);
			gr.update();
		}
	}
}

backFillRootTopicId();
