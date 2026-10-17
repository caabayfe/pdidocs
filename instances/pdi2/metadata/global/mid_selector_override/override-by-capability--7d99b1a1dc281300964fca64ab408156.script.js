/*
MIDSelection override for cloud. Customers can modify this script include to override any other custom changes. For example, for CMP provision use cases, one can use the context to get additional attributes (e.g. vpc)

Out of box, in cases when there is no specific match,  we want to fallback to a more general provider match (AWS, Azure, etc..) and if there is no match, then we want to fallback to a even more general cloud level. Here is some examples.

Example 1:

Request:
	capability: [{capability : "AWS", value: "US-WEST1"}]
	capability: [{capability : "Cloud Management"}]

MID configruation:
	MIDA:
		capability: AWS, Value: null
		capability: Cloud Management, Value: null

If there is no override, then we wont match MIDA since there is a specific value for the ldc. This override will make sure we find MIDA by finding MIDS that just have the AWS capability with no value.


Example 2:
	capability: [{capability : "AWS", value: "US-WEST1"}]
	capability: [{capability : "Cloud Management"}]

MID configruation:
	MIDA:
		capability: Cloud Management, Value: null

If there is no override, then we wont match MIDA since there is no AWS capability defined on the MID. This override will make sure we find MIDA by finding MIDS that just have the Cloud capability with no value.

@param {array of MIDServerJS} candidateMIDList All Mids
@param {array of MIDServerJS} defaultSelectedMIDList Filtered MID list
@param {object} midSelectorContext Extra contextual parameters passed in for CMP uses cases.
@param {object} requestedParameters MIDSelectorParamJS - a POJO to get requested MID selection criteria such as application, target, capabilities

MIDServerJS: a POJO representing MID server object. Can get MID name, status, capabilities, IP range, applications assing to that MID

*/
(function filter(/* MIDServerJS Array */  candidateMIDList, /* MIDServerJS Array */  defaultSelectedMIDList, /* Native JS object */ midSelectorContext, /* MIDSelectorParamJS */ requestedParameters) {
		// If anything matching no need to do anything
		if (defaultSelectedMIDList.length > 0)
			return defaultSelectedMIDList;

		// Check if this is cloud capability - if not nothing to do
		if (!hasCloudCapability(requestedParameters.capabilities))
			return defaultSelectedMIDList;

		// get first non cloud capability (e.g AWS) - there should be only one more
		var capability = getNonCloudCapability(requestedParameters.capabilities);
		if (JSUtil.nil(capability)) {
			gs.warn("MID Selection filterOnCapability could not find a capablity for provider!");
			return defaultSelectedMIDList;
		}

		// Get mid with AWS capability
		var mids = getMidsWithCapability(capability);

		if (mids.length > 0)
			return mids;

		mids = getMidsWithCapability('Cloud Management');

	    getMidsWithoutCapability(mids, capability);
	    return mids;

		//
		// INNER FUNCTIONS
		//

		//
		// Do we have the Cloud capability in the list?
		//
		function hasCloudCapability(capabilities) {
			for(var j in capabilities) {
				if(capabilities[j].capability == 'Cloud Management')
					return true;
			}

			return false;
		}

		//
		// Get the first non cloud capability (e.g. AWS)
		//
		function getNonCloudCapability(capabilities) {
			for(var j in capabilities) {
				if(capabilities[j].capability != 'Cloud Management')
					return capabilities[j].capability;
			}

			return null;
		}

		//
		// Get the mids with this specific capability
		//
		function getMidsWithCapability(capability) {
			var selectedMids = [];
			for (var i in candidateMIDList) {
				//Get all capabilities assign to a MID server
				var capabilities = candidateMIDList[i].capabilities;

				for(var j in capabilities) {
					if('' + capabilities[j].capability == '' + capability &&
						   JSUtil.nil(capabilities[j].value))
					selectedMids.push(candidateMIDList[i]);
				}
			}

			return selectedMids;
		}

		//
		// Filter out the mids with certain capability (Check name only, ignore value)
		//
		function getMidsWithoutCapability(mids, capability) {
			for (var i = 0; i < mids.length; i ++) {
				for (var j = 0; j < mids[i].capabilities.length; j ++) {
					if (mids[i].capabilities[j].capability + '' == capability + '') {
						mids.splice(i, 1);
					}
				}
			}
		}

})(candidateMIDList, defaultSelectedMIDList, midSelectorContext, requestedParameters);
