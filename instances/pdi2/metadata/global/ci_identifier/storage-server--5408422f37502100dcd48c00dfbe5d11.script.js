function(ciData, log, identifier) {
	/**
	 * Match against object path.
	 * @return string[] SysIDs
	 */
	function findByObjectPath(ciData) {		
		// search by discovery's primary key first
		var gr = new GlideRecord('cmdb_ci_storage_server');
		gr.addQuery('cim_object_path', ciData.data.cim_object_path);	
		gr.query();
		
		var matches = [];
		while (gr.next())
			matches.push(''+gr.sys_id);

		return matches;
	}
	
	/**
	 * Match against name and cim object name.
	 * @return string[] SysIDs
	 */
	function findByName(ciData) {
		var gr = new GlideRecord('cmdb_ci_storage_server');
		var condition = gr.addQuery('name', ciData.data.name);
		
		// search for the pre-Eureka primary key. remove in "H" release. originally used as ci.name
		if (!gs.nil(ciData.data._cimObjectName))
			gr.appendOrQuery(condition, 'name', ciData.data._cimObjectName);
			
		gr.query();

		var matches = [];
		while (gr.next())
			matches.push(''+gr.sys_id);

		return matches;
	}
	
	/**
	 * Match dispaly serial number and either object path or empty object path. The Serial Number identifier
	 * will skip / not match if the serial number table has already been filled out (not an import).
	 * @return string[] SysIDs
	 */
	function findBySerial(ciData, log) {
		var result = CIIdentifier.run('Serial Number & Class Name', 'cmdb_ci_storage_server', ciData, log);
		if (result.matched.length === 0) // skip further processing if none were found 
			return result.matched;
		
		// iterate through matches and look for imported servers (those without object path).
		// the display serial number should be trusted to be unique when imported manually.
		var gr = new GlideRecord('cmdb_ci_storage_server');
		gr.addQuery('sys_id', result.matched);
		var pathCondition = gr.addQuery('cim_object_path', ciData.data.cim_object_path);
		gr.appendOrQuery(pathCondition, 'cim_object_path', ''); // imports won't have this
		gr.query();
		
		var matches = [];
		while (gr.next())
			matches.push(''+gr.sys_id);

		// the matching ci, if any, will have it's object path updated and will match on primary key on next run
		return matches;
	}
	
	var isMatchable = ( !gs.nil(ciData.data.name) && !gs.nil(ciData.data.cim_object_path) );
	if (!isMatchable)
		return new CIIdentifierResult([], isMatchable, true); // terminate identifier chain
	
	var matches = findByObjectPath(ciData);
	if (matches.length !== 1)
		matches = findByName(ciData);
	if (matches.length !== 1)
		matches = findBySerial(ciData, log);

	return new CIIdentifierResult(matches, isMatchable, true); // terminate identifier chain
}
