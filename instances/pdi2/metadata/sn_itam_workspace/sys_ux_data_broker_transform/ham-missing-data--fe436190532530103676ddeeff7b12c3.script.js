function transform(input) {
	return {
        "missingData": new AssetWorkspaceUtil().getMissingData(input)
    };
}
