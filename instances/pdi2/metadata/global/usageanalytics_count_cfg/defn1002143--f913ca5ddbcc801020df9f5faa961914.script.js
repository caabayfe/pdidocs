var prevMonth = SNC.UsageAnalyticsScriptUtils.getLastMonthAccrualTimeStamp();

var exemptedTableNames = [];
var exemptedTableGr = new GlideRecord('ua_exempted_table_inventory');
exemptedTableGr.query();
while(exemptedTableGr.next())
	exemptedTableNames.push(exemptedTableGr.getValue('table_name'));


var allotedCustomTables = [];
var customTableGr = new GlideRecord('ua_custom_table_inventory');
var qc = customTableGr.addQuery('allotment_type',2);
qc.addOrCondition('allotment_type',3);
customTableGr.query();
while(customTableGr.next())
	allotedCustomTables.push(customTableGr.getValue('table_name'));


var tablesList = exemptedTableNames.concat(allotedCustomTables);
var totalSum = 0;

var ctUsageGr = new GlideAggregate('ua_ct_usage');
ctUsageGr.addQuery('time_stamp', prevMonth);
ctUsageGr.addQuery('table_name','NOT IN',tablesList);
ctUsageGr.addAggregate('SUM', 'insert_count');
ctUsageGr.addAggregate('SUM', 'update_count');
ctUsageGr.addAggregate('SUM', 'delete_count');
ctUsageGr.query();
while (ctUsageGr.next()) {
	var insertCount = parseInt((ctUsageGr.getAggregate('SUM', 'insert_count') == '')? 0 : ctUsageGr.getAggregate('SUM', 'insert_count'));
	var updateCount = parseInt((ctUsageGr.getAggregate('SUM', 'update_count') == '')? 0 : ctUsageGr.getAggregate('SUM', 'update_count'));
	var deleteCount = parseInt((ctUsageGr.getAggregate('SUM', 'delete_count') == '')? 0 : ctUsageGr.getAggregate('SUM', 'delete_count'));

	totalSum = totalSum + insertCount + updateCount + deleteCount;
}

answer = totalSum;
