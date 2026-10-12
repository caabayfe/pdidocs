(function refineQuery(current, parent) {

	var listModelId = 'c3547169534723003eddddeeff7b126c';
	var relatedListModelId = 'd91731a9534723003eddddeeff7b121c';
	current.addQuery('model', 'IN', [listModelId, relatedListModelId]);
	current.addQuery('active', '=', true);
	current.addQuery('enabled', '=', true);
	current.addQuery('table', '=', 'global');
	current.addQuery('experience_restricted', '!=', true);
	current.addQuery('workspace','=',null);
	current.addQuery('declarative_action_type', 'IN', ['server_script', 'uxf_client_action', 'client_script']);	

})(current, parent);
