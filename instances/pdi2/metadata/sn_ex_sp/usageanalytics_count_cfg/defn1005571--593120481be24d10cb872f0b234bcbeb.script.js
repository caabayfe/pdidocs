var hrTables = ["sn_hr_core_case", "sn_hr_core_case_benefits", "sn_hr_core_case_compensation", "sn_hr_core_case_corporate_communication", "sn_hr_core_case_global_mobility", "sn_hr_core_case_operations", "sn_hr_core_case_payroll", "sn_hr_core_case_talent_management", "sn_hr_core_case_total_rewards", "sn_hr_core_case_workforce_admin", "sn_hr_le_case"];
var legalTables = ["sn_lg_ops_compliance", "sn_lg_ops_corporate_support", "sn_lg_ops_crime", "sn_lg_ops_digital_forensics", "sn_lg_ops_ethics", "sn_lg_ops_general_contract_support", "sn_lg_ops_general_legal", "sn_lg_ops_government_affairs", "sn_lg_ops_health_safety_and_environment", "sn_lg_ops_labor_and_employment", "sn_lg_ops_legal_operations", "sn_lg_ops_licensing_and_tech_transactions", "sn_lg_ops_litigation", "sn_lg_ops_marketing_support", "sn_lg_ops_mergers_and_acquisitions", "sn_lg_ops_patents_trademark_and_trade_secrets", "sn_lg_ops_privacy_and_data_security", "sn_lg_ops_procurement_contract_support", "sn_lg_ops_real_estate", "sn_lg_ops_sales_contract_support"];
var procurementTables = ["sn_spend_psd_procurement_request"];
var wsdTables = ['cmn_location', 'sn_wsd_core_approval_configuration', 'sn_wsd_core_approval_definition', 'sn_wsd_core_area', 'sn_wsd_core_arrival_entry', 'sn_wsd_core_arrival_schedule', 'sn_wsd_core_block_location', 'sn_wsd_core_building', 'sn_wsd_core_campus', 'sn_wsd_core_client_role_rule', 'sn_wsd_core_floor', 'sn_wsd_core_floor_plan_update_log', 'sn_wsd_core_html_signing_template', 'sn_wsd_core_m2m_location_shift', 'sn_wsd_core_m2m_user_shift', 'sn_wsd_core_performer_criteria', 'sn_wsd_core_planned_task_def', 'sn_wsd_core_qr', 'sn_wsd_core_region', 'sn_wsd_core_reservation', 'sn_wsd_core_room', 'sn_wsd_core_shift', 'sn_wsd_core_site', 'sn_wsd_core_space', 'sn_wsd_core_space_staging', 'sn_wsd_core_space_type', 'sn_wsd_core_workplace_location', 'sn_wsd_core_workplace_profile', 'sn_wsd_core_workplace_request', 'sn_wsd_core_workplace_task', 'sn_wsd_core_workplace_user', 'sn_wsd_case_fulfillment_instruction', 'sn_wsd_case_m2m_service_item_location', 'sn_wsd_case_m2m_service_location', 'sn_wsd_case_service_item_request', 'sn_wsd_case_tier_definition', 'sn_wsd_case_workplace_case', 'sn_wsd_case_workplace_field_mapping', 'sn_wsd_case_workplace_service', 'sn_wsd_case_workplace_service_activity', 'sn_wsd_case_workplace_service_item', 'sn_wsd_case_workplace_template_configuration', 'sn_wsd_rsv_extra_service', 'sn_wsd_rsv_layout', 'sn_wsd_rsv_m2m_location_layout', 'sn_wsd_rsv_m2m_location_reservable_purpose', 'sn_wsd_rsv_m2m_location_standard_service', 'sn_wsd_rsv_m2m_reservable_module_time_slot', 'sn_wsd_rsv_m2m_reservable_module_user_criteria', 'sn_wsd_rsv_m2m_reservable_module_view_configuration', 'sn_wsd_rsv_m2m_reservable_module_workplace_location', 'sn_wsd_rsv_reservable_module', 'sn_wsd_rsv_reservable_purpose', 'sn_wsd_rsv_reservable_view', 'sn_wsd_rsv_reservation', 'sn_wsd_rsv_reservation_path', 'sn_wsd_rsv_standard_service', 'sn_wsd_rsv_time_slot', 'sn_wsd_visitor_m2m_location_policy', 'sn_wsd_visitor_m2m_user_visitor', 'sn_wsd_visitor_organization', 'sn_wsd_visitor_policy', 'sn_wsd_visitor_visit', 'sn_wsd_visitor_visit_log', 'sn_wsd_visitor_visitor', 'sn_wsd_visitor_visitor_policy_confirmation', 'sn_wsd_visitor_vistor_registration', 'sn_wsd_mappedin_type_mapping', 'sn_wsd_rsv_reservation', 'sn_wsd_rsvsync_calendar_item', 'sn_wsd_rsvsync_delta', 'sn_wsd_rsvsync_event', 'sn_wsd_rsvsync_provider', 'sn_wsd_rsvsync_reservable_sync_configuration', 'sn_wsd_spcmgmt_location_cc_dept_map', 'sn_wsd_mobile_st_mobile_reservation'];
var itTables = ["incident", "change_request", "std_change_producer_version", "std_change_properties", "std_change_proposal", "std_change_proposal_task", "std_change_record_producer", "std_change_template"];

var results = {hrPortal: false, legalPortal: false, procurementPortal: false, wsdPortal: false, itPortal: false, customPortal: false};

// check portals using new taxonomy
if (hasTaxonomy()) {
    var taxonomyId = getTaxonomyId();
    if (taxonomyId) {
        var gr = new GlideRecord("m2m_connected_content");
        gr.addQuery("topic.taxonomy", taxonomyId);
        gr.query();
        
        while(gr.next()) {
            if (hrTables.indexOf(gr.catalog_item.table_name.getValue("name")) > -1)
                results.hrPortal = true;
            else if (legalTables.indexOf(gr.catalog_item.table_name.getValue("name")) > -1)
                results.legalPortal = true;
            else if (procurementTables.indexOf(gr.catalog_item.table_name.getValue("name")) > -1)
                results.procurementPortal = true;
            else if (wsdTables.indexOf(gr.catalog_item.table_name.getValue("name")) > -1)
                results.wsdPortal = true;
            else if (itTables.indexOf(gr.catalog_item.table_name.getValue("name")) > -1)
                results.itPortal = true;
            else
                results.customPortal = true;
        }
    }
}

// check portals using old taxonomy
gr = new GlideRecord("m2m_sp_portal_catalog");
gr.addActiveQuery();
gr.addEncodedQuery("sp_portal.sys_id=70cd9f3b734b13001fdae9c54cf6a72f^ORsp_portal.url_suffix=esc");

if (gr.isValid()) {
	gr.query();
	while(gr.next()) {
		var catItemGr = new GlideRecord("sc_cat_item_producer");
		catItemGr.addActiveQuery();
		catItemGr.addEncodedQuery("sc_catalogsLIKE" + gr.sc_catalog.toString());
		catItemGr.query();
		while (catItemGr.next()) {
			tableName = catItemGr.table_name.getValue("name");
			if (hrTables.indexOf(tableName) > -1)
				results.hrPortal = true;
			else if (legalTables.indexOf(tableName) > -1)
				results.legalPortal = true;
			else if (procurementTables.indexOf(tableName) > -1)
				results.procurementPortal = true;
			else if (wsdTables.indexOf(tableName) > -1)
				results.wsdPortal = true;
			else if (itTables.indexOf(tableName) > -1)
				results.itPortal = true;
			else if (tableName!='sc_req_item' && tableName!='universal_request')
				results.customPortal = true;
		}
	}
}

answer = JSON.stringify({
	count: 1,
	results: results
});

function getTaxonomyId() {
    var gr = new GlideRecord("m2m_sp_portal_taxonomy");
    gr.addActiveQuery();
    gr.addEncodedQuery("sp_portal.sys_id=70cd9f3b734b13001fdae9c54cf6a72f^ORsp_portal.url_suffix=esc");
    gr.query();
    if (gr.next())
        return gr.getValue("taxonomy");
}

function hasTaxonomy() {
    var gr = new GlideRecord("sys_db_object");
    gr.addQuery("name", "taxonomy");
    gr.query();
    return gr.hasNext();
}
