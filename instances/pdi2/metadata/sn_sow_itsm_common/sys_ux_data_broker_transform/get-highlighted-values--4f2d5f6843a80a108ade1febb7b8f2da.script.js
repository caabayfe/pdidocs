function transform(input) {
	if (!input || !input.field || !input.table || !gs.tableExists(input.table)) return {};
	return new sn_sow_itsm_common.SOWITSMHighlightedColorUtils().getAllHighlightedColors(input.table, input.field);
}
