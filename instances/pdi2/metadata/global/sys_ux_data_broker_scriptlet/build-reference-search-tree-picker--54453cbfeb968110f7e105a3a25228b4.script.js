function transform(input) {
	var domainSep = input.graphqlData.data.GlideLayout_Query.formLayout.domainSeparation;
    return ({
        treePickerConfig: input.graphqlData.data.GlideLayout_Query.treePickerConfigQuery.treePicker,
        domainId: domainSep ? domainSep.domainId : null
    });
}
