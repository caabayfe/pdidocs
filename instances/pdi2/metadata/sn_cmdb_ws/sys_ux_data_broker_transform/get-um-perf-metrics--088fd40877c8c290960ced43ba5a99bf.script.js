// returns array of matching CIs to supplied search text for CI name
function transform(input) {
	var result = {
		query: input.query,
		max: input.max,
		matches: 0,
		result: []
	};
	
	var gr = new GlideRecord('sn_cmdb_ws_um_perf_metrics');
	gr.addEncodedQuery(input.query, true);
	gr.setLimit(input.max);
	gr.query();
	while(gr.next() && result.matches <= input.max) {
		result.matches++;
		result.result.push({
			app_id: gr.getValue('app_id'),
			app_name: gr.app_id.title.getDisplayValue(),
			base_state_type: gr.getValue('base_state_type'),
			browser: gr.getValue('browser'),
			ci_sysid: gr.getValue('ci'),
			ci_name: gr.getDisplayValue('ci'),
			cmdb_frontend_time: gr.getValue('cmdb_frontend_time'),
			cmdb_getmap_api_time: gr.getValue('cmdb_getmap_api_time'),
			cmdb_map_only: gr.getValue('cmdb_map_only'),
			has_related_item_badging_data: gr.getValue('has_related_item_badging_data'),
			levels: gr.getValue('levels'),
			nodemap_component_rendering_time: gr.getValue('nodemap_component_rendering_time'),
			number_of_edges: gr.getValue('number_of_edges'),
			number_of_nodes: gr.getValue('number_of_nodes'),
			sm_getmap_api_time: gr.getValue('sm_getmap_api_time'),
			start_time: gr.getValue('start_time'),
			total_backend_time: gr.getValue('total_backend_time'),
			total_roundtrip_time: gr.getValue('total_roundtrip_time'),
			uxf_getmap_inbound_return_time: gr.getValue('uxf_getmap_inbound_return_time'),
			uxf_getmap_outbound_call_time: gr.getValue('uxf_getmap_outbound_call_time')
		});
	}
	
	return result;
}
