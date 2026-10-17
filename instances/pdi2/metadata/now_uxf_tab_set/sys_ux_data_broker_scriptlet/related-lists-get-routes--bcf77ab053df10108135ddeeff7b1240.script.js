function transform(input) {
	function itemTransform(item, index) {
		return {
			route: "related_list",
			fields: {
				title: item.displayLabel,
				table: item.targetTable,
				filter: item.filter
			},
			label: item.displayLabel + " - " + item.count
		};
	}
	
	return input
		.graphqlData
		.data.GlideLayout_Query.formLayout.relatedLists
		.map(itemTransform);
}
