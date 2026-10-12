var LAYOUT_BOUND_TABLE = "sys_ux_layout_bounds";
var MACROPONENT = "macroponent";
var BOUNDS = "bounds";
var MACROPONENT_LAST_MOD_COUNT = "macroponent_last_mod_count";
var MACROPONENT_TABLE = "sys_ux_macroponent";

persistBounds(event);

function persistBounds(event) {
	var bounds = JSON.parse(event.parm1) || [];
	var gr = new GlideRecord(LAYOUT_BOUND_TABLE);
	if (!gr.isValid()) return;
	bounds.forEach(bound => {
		var macroponentId = bound.macroponentSysId;
		var currentBounds = bound.bounds || {};
		var macroponentModCount = null;
    
		var macroponentGr = new GlideRecord(MACROPONENT_TABLE);
		if (macroponentGr.get(macroponentId)) {
			macroponentModCount = macroponentGr.getValue('sys_mod_count');
		}
		
		var boundRecord = new GlideRecord(LAYOUT_BOUND_TABLE);
    var isLastModCountValidField = boundRecord.isValidField(MACROPONENT_LAST_MOD_COUNT);
		if (boundRecord.get(MACROPONENT, macroponentId)) {
			var existingBounds = JSON.parse(boundRecord.getValue(BOUNDS));
			existingBounds = {
				...existingBounds,
				...currentBounds
			};
			boundRecord.setValue(BOUNDS, JSON.stringify(existingBounds));
			if (isLastModCountValidField) {
			  boundRecord.setValue(MACROPONENT_LAST_MOD_COUNT, macroponentModCount);
			}
			boundRecord.update();
		} else {
			boundRecord.setValue(MACROPONENT, macroponentId);
			boundRecord.setValue(BOUNDS, JSON.stringify(currentBounds));
			if (isLastModCountValidField) {
				boundRecord.setValue(MACROPONENT_LAST_MOD_COUNT, macroponentModCount);
			}
			boundRecord.insert();
		}
	});
}
