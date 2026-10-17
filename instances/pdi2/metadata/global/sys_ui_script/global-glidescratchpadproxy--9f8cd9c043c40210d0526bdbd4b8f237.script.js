/**
 * Currently, the approach for proxying 'g_scratchpad' is this:
 * 
 * Manually run the "before_display" business rules for a given collection (table). 
 * We use GlideScopedEvaluator for this
 * Inject a temporary object named as 'g_scratchpad' in that evaluator context 
 * When the display BRs execute, they (can) set data on our 'g_scratchpad' object
 * 
 * However, this proxy 'g_scratchpad' isn't functionally same as the g_scratchpad you have on a Form.
 * Main difference is that the 'g_scratchpad' of a Form lives until the Form page is open, and this proxy
 * 'g_scratchpad' is only limited to the life of the current Glide transaction.
 * 
 * In a Form page, multiple client scripts can access the same scratchpad object, share data by writing on it.
 * 
 * But when executing the client scripts on the server, we only do that for a single action, 
 * like "onChange" of a "assigned_to" field. This is a single transasction.
 * A 'g_scratchpad' can be built in the transaction, but it will only live in that transaction. 
 * The next time you want to run some other client scripts, say "onChange" of "state", or "onSubmit",
 * we would do that in a new Glide transaction, where the same "g_scratchpad" object will not be available.
 */
function ScratchpadProxy(tableName, sysId) {
	if (!tableName || !sysId) {
		throw 'g_scratchpad proxy: tableName or sysId is missing';
	}

	var BR_TABLE = 'sys_script';
	var SCRIPT_FIELD = 'script';

	var scratchpad = {};

	function executeDisplayBRs(dataRecord) {
		var brRecord = new GlideRecord(BR_TABLE);
		brRecord.addQuery('active', true);
		brRecord.addQuery('advanced', true); // only advanced BRs will have script (i.e., g_scratchpad usage)
		brRecord.addQuery('when', 'before_display');
		brRecord.addQuery('collection', tableName);
		brRecord.query();
		while (brRecord.next()) {
			_execute_(dataRecord, brRecord);
		}
	}

	function _execute_(dataRecord, brRecord) {
		var gse = new GlideScopedEvaluator();
		var result = gse.evaluateScript(brRecord, SCRIPT_FIELD, {
			current: dataRecord,
			previous: dataRecord,
			g_scratchpad: scratchpad // display business rules will 'write' here
		});
		return result;
	}

	function queryDataRecord() {
		var gr = new GlideRecord(tableName);
		if (gr.get(sysId))
			return gr;
		return null;
	}

	var dataGr = queryDataRecord();
	if (dataGr)
		executeDisplayBRs(dataGr);
	
	var self = this;
	Object.keys(scratchpad).forEach(function(k) {
		this[k] = scratchpad[k];
	});
}

// var g_scratchpad = new ScratchpadProxy();

// TBD - initialize 'g_scratchpad' on the global context
csGlobals['g_scratchpad'] = new ScratchpadProxy(csInputs.tableName, csInputs.sysId);
