var NetBaseReconciler;

(function() {
NetBaseReconciler = {
	reconcile: reconcile
};

var table, columns, data, markAbsent, forceUpdate;

/*
Reconcile a set of incoming data against a subset of the existing database table.  Called with the following:

args:  An object containing the following:

	table:        The name of the table where data is to be reconciled

	filters:      An object of column names to values for building a query to get the subset of existing records to be reconciled

	columns:      An array of column names on the given table to use for reconciliation

	data:         An array of objects where each entry represents an incoming row to be reconciled against existing records

	markAbsent:   Mark existing records as absent if they are not contained in the current data (optional, default false)

	forceUpdate:  Always update existing records (sys_updated_on) even if incoming data is unchanged (optional, default false)
 
Example:

var args = {
	table:'discovery_switch_fwd_table',
	filters:{ cmdb_ci:'abcdef1234567890abcdef1234567890', vlan_id:'123' },
	columns:['mac_address'],
	data:[ {'mac_address':'00:1f:12:32:b7:bf', 'port':158, 'status':'learned'} ],
	markAbsent: false,
	forceUpdate: false
}
NetBaseReconciler.reconcile(args);

*/
function reconcile(args) {
	var filters;
	table = args.table;
	columns = args.columns;
	filters = args.filters;
	data = args.data;
	markAbsent = args.markAbsent || false;
	forceUpdate = args.forceUpdate || false;
	if (!table || !columns || !filters || !data)
		return;

	var gr = new GlideRecord(table);
	Object.keys(filters).forEach(function(key) {
		gr.addQuery(key, filters[key]);
	});
	gr.query();
	while (gr.next())
		reconcileSingleRecord(gr);
	insertNewData();
}

function reconcileSingleRecord(gr) {
	var i, obj;
	for (i in data) {
		obj = data[i];
		if (matchObject(gr, obj)) {
			updateMatchedRecord(gr, obj);
			data.splice(i, 1);
			return;
		}
	}
	if (markAbsent === true)
		markRecordAbsent(gr);
}

function matchObject(gr, obj) {
	var i, key;
	for (i in columns) {
		key = columns[i];
		if (gr.getValue(key) != obj[key])
			return false;
	}
	return true;
}

function updateMatchedRecord(gr, obj) {
	var key;
	for (key in obj)
		gr.setValue(key, obj[key]);
	gr.setValue('absent', false);
	if (forceUpdate === true)
		gr.setForceUpdate(true);
	gr.update();
}

function markRecordAbsent(gr) {
	if (gr.getValue('absent') == 'true')
		return;
	gr.setValue('absent', true);
	gr.update();
}

function insertNewData() {
	data.forEach(function(obj) {
		insertNewRow(obj);
	});
}

function insertNewRow(obj) {
	var key;
	var gr = new GlideRecord(table);
	for (key in obj)
		gr.setValue(key, obj[key]);
	gr.insert();
}

})();
