function handler({
    api,
    event,
    imports
}) {
	if(api.data.gliderecord_query.output.data.GlideRecord_Query.kb_knowledge._results.length > 0) {
    	api.setState('parentId', api.data.gliderecord_query.output.data.GlideRecord_Query.kb_knowledge._results[0].kb_knowledge_base.value);
    }
}
