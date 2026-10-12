function transform(input) {
	var dropdownValues = new sn_itam_workspace.AssetWorkspaceUtil().getDropwdownValues(input);
	if (input.repeaterRowId === null)
		return dropdownValues;
	var output = {'repeaterRowId': input.repeaterRowId, 'dropdownValues': dropdownValues};
	return output;
}
