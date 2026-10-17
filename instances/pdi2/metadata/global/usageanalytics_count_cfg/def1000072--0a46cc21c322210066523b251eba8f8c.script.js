// Aggregate the access counts on google map usage records this month across all users.
// This gets persisted daily,so on any day of the month, you see the cumulative total of the map page hits
// on the month, until that point

var nHits = 0;

if (GlideTableDescriptor.isValid('ua_app_usage')) {
	// First calculate the current month timestamp
	var now = new Date();
	var curMonth = now.getMonth() + 1;
	var tstamp = now.getFullYear() + '-' + (parseInt(curMonth) < 10 ? '0' + curMonth : curMonth);

	// Now aggregate the data across the current month and get the total map page access count
	var ga = new GlideAggregate('ua_app_usage');
	ga.groupBy('time_stamp');
	ga.addQuery('app_name', 'Google Maps');
	ga.addQuery('app_type', 'ServiceNow');
	ga.addQuery('time_stamp', tstamp);
	ga.addAggregate('SUM', 'access_count');
	ga.query();

	if (ga.getRowCount() == 1) {
		ga.next();
		nHits = ga.getAggregate('SUM', 'access_count');
	}
}

// gs.log('Number of Google Map page hits : ' + nHits);
answer = nHits;
