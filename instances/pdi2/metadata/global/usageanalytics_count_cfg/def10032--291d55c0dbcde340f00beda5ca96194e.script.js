
			var totalSum = new GlideAggregate('license_details');
totalSum.addQuery('table_count', '!=','N/A');
totalSum.addAggregate('SUM', 'table_count');
totalSum.query();

var allTotalCost = 0;
while (totalSum.next()) {
   allTotalCost += parseInt(totalSum.getAggregate('SUM', 'table_count'));
}
answer = allTotalCost;
