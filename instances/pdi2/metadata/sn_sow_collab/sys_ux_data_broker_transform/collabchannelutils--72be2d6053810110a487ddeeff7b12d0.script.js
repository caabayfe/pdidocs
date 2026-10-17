function transform(input) { 
	var output = {};
	output.channelData = new sn_sow_collab.SowCollabUtils().handleChannelRedirect(input.recordSysId, input.tableName, input.requestorData);
	return output;
}
