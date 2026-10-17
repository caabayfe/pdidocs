(function executeRule(current, previous /*null when async*/) {
	/**
	 * Checks if the URL path that is to be inserted or updated is unique.
	 *
	 * It will be considered non-unique in the following 3 cases:
	 *   - If any existing URL path starts with the new path
	 *   - If any existing URL path is the start of the new path
	 *   - If the new path is equal to an existing URL path
	 */
	function doesURLPathAlreadyExist(currSysId, pathToCheck) {
		var pathArray = pathToCheck.split("/");
		var shortenedPathArray = pathArray.length > 1 ? pathArray.slice(0,pathArray.length - 1) : pathArray;

		var sysUXPageRegistryGR = new GlideRecord('sys_ux_page_registry');
		sysUXPageRegistryGR.addQuery('sys_id', '!=', currSysId);
		sysUXPageRegistryGR.query();
		while(sysUXPageRegistryGR.next()){
			var existingPath = sysUXPageRegistryGR.getValue("path").split("/");
			var shortenedExistingPath = existingPath.length > 1 ?  existingPath.slice(0,existingPath.length - 1)  : existingPath;
            if(pathArray.join('/') === existingPath.join('/') || (existingPath.length != pathArray.length && (pathArray.join('/') === shortenedExistingPath.join('/') || shortenedPathArray.join('/') === existingPath.join('/')))) {
                return true;
            }
		}
		
		return false;
	}
	
	if (doesURLPathAlreadyExist(current.sys_id, current.path)) {
		gs.addErrorMessage(gs.getMessage('A record with the same URL path or sub path already exists. Please set a new unique URL path.'));
		current.setAbortAction(true);
	}
})(current, previous);
