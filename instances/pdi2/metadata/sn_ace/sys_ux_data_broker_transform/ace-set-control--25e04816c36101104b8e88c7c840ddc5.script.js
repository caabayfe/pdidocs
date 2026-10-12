function transform(input) {
    if (!input || !input.payload) return [];
	return new ACEAppBuilderUtil().setControl(input.payload);
}
