moveAssetExpenseToCI();

function moveAssetExpenseToCI(){
	// copy asset into secondary source fields
	current.asset = current.source_id;

	// use ci to overwrite primary source field
	var gr = new GlideRecord('cmdb_ci');
	gr.addQuery('sys_id', current.ci); // do this way to avoid warning about non-existent records
	gr.query();

	// if the CI is already in the DB, take its class name. If insert of CI caused insert of asset, then it won't be in db
	if (gr.hasNext())
		current.source_table = current.ci.sys_class_name;
	else
		current.source_table = 'cmdb_ci';

	current.source_id = current.ci;
}
