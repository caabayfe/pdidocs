(function executeRule(current, previous /*null when async*/) {
	var componentHashes = [];
	var inputs = current.inputs;
	if (inputs.component != null) {
		if (previous != null && inputs.component == previous.inputs.component)
			return;

		// push string instead of GlideElement to componentHashes
		componentHashes.push(inputs.component.toString());
	} else if (inputs.component_values != null) {
		if (previous != null && inputs.component_values == previous.inputs.component_values)
			return;

		var terms = inputs.component_values.split('^');
		for (var i = 0; i < terms.length - 1; i++) {
			var hash = terms[i].split('=')[0];
			if (gs.nil(hash))
				continue;

			componentHashes.push(hash);
		}
	} else
		return;

	var snapshotUtil = new sn_atf.ATFSnapshot();
	var mugshotsCacheJson = snapshotUtil.getMugshotsJSONbyHash(current.test, current.order, componentHashes);
	mugshotsCacheJson = addPreviousMugshotJSON(mugshotsCacheJson);
	current.mugshots_cache_json = mugshotsCacheJson;

	/** This is necessary if the snapshot no longer exists. Copies over previous mugshot cache data to prevent it from being cleared out and lost. */
	function addPreviousMugshotJSON(newMugshotsCacheJSON) {
		var tempMugshotCacheData;
		// use previous.mugshots_cache_json for updates and current.mugshots_cache_json for inserts since previous does not exist
		if (previous.isValidRecord())
			tempMugshotCacheData = previous.mugshots_cache_json;
		else
			tempMugshotCacheData = current.mugshots_cache_json;

		if (!tempMugshotCacheData)
			return newMugshotsCacheJSON;

		newMugshotsCacheJSON = JSON.parse(newMugshotsCacheJSON);
		var previousMugshotsCacheJSON = JSON.parse(tempMugshotCacheData);
		for (var prevMugshotHash in previousMugshotsCacheJSON) {
			if (componentHashes.indexOf(prevMugshotHash) === -1)
				continue;

			if (newMugshotsCacheJSON.hasOwnProperty(prevMugshotHash))
				continue;

			newMugshotsCacheJSON[prevMugshotHash] = previousMugshotsCacheJSON[prevMugshotHash];
		}

		return JSON.stringify(newMugshotsCacheJSON);
	}
})(current, previous);
