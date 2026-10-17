var using = 0;
var result = 0;

var baseQuery = 'chart.sub_category=cis_processed_by_ire^chart.feature=cmdb_feature_adoption^chart.category=data_ingestion^state=2^group_by=';
var usingIRE = 'using_ire';
var notUsingIRE = 'not_using_ire';

var gr = new GlideRecord('sn_cmdb_ws_base_aggregate_data');
gr.addEncodedQuery(baseQuery + usingIRE);
gr.query();
if(gr.next()){
	using = parseInt(gr.getValue("count"));

	var gr2 = new GlideRecord("sn_cmdb_ws_base_aggregate_data");
	gr2.addEncodedQuery(baseQuery + notUsingIRE);
	gr2.query();

	var notUsing = gr2.next() ? parseInt(gr2.getValue("count")) : 0;
	result = (using/(using+notUsing)).toFixed(2)*100;
}

answer = result;
