function transform(input) {
	return new sn_uib_dyn_rel_rec.RelatedRecordsUtil().getRelatedRecordDefinitions(input.table, input.sysId, input.optional_table, input.optional_sysId);
}
