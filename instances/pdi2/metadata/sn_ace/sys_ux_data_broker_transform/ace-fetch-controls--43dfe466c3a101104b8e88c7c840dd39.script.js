function transform(input) {
    if (!input || !input.payload) return [];
	var controlProps = new ACEAppBuilderUtil().getControl(input.payload);
	return controlProps;
}
