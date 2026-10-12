function transform(input) { 
	var output = {};
	output.channelData = new sn_uib_collab.CollabUtils().handleChannelRedirect(input.recordSysId, input.tableName, input.requestorData);
	return output;
}
