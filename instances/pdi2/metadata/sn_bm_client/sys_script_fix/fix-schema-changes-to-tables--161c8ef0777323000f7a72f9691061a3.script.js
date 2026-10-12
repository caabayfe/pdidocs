var sysids = new BenchmarkUtil().breakdownRecordSysIDs;
var targeted_tables = ['sn_bm_client_score', 'sn_bm_client_company_history', 'sn_bm_client_document'];
var breakdowns = 	[{
						table: 'sn_bm_common_industry',
						sys_id: sysids.industry
					 }, {
						table: 'sn_bm_common_size_bucket',
						sys_id: sysids.sizeBucket
					 }, {
						table: 'sn_bm_client_region',
						sys_id: sysids.region
					 }
					];

function fixSchema(targeted_table, breakdown_table, sysid) {
	var gr = new GlideRecord(targeted_table);
	gr.addQuery('breakdown', breakdown_table);
	gr.setValue('breakdown_type', 'reference');
	gr.setValue('breakdown_table', breakdown_table);
	gr.setValue('breakdown_reference', sysid);
	gr.updateMultiple();
}

for (var i in targeted_tables)
	for (var j in breakdowns)
		fixSchema(targeted_tables[i], breakdowns[j].table, breakdowns[j].sys_id);
