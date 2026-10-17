function transform(input){
	var clientScriptIds = input.client_script_ids;
	if (!clientScriptIds || clientScriptIds.length === 0)
		return;

	// If there are more than 1 sysIds, then format them for "IN" query.
	if (clientScriptIds.length > 1)
		clientScriptIds = clientScriptIds.join();
	else
		clientScriptIds = clientScriptIds[0];

	var res = new global.GlobalServiceCatalogUtil().deleteClientScripts(clientScriptIds);

	return {
		result: res
	};
}
