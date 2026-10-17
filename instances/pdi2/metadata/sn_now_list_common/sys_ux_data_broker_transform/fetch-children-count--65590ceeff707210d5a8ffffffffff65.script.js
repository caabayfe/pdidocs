function transform(input) {
	if (!input || !input.table || !input.groupBy || !input.query) return [];
	var childCount = new GlideAggregate(input.table);
	if (input.query) {
		childCount.addEncodedQuery(input.query);
	}
	if (input.groupBy) {
		childCount.groupBy(input.groupBy);
	}
	childCount.addAggregate('COUNT');
	childCount.query();
	var aggregates = [];
	while (childCount.next()) {
		var aggregate = {groupBy: []};
		aggregate.count = Number(childCount.getAggregate('COUNT'));
    var valueObj = {value: childCount.getValue(input.groupBy) };
		aggregate.groupBy.push(valueObj);
		aggregates.push(aggregate);
	}
	return aggregates;
}
