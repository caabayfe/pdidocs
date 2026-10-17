function script({api, event}) {
    api.data.getDataFilterEncodedQuery.execute({
        "table": api.state.policyData.data_filter.table || api.state.defaultTable,
        "encodedQuery": api.state.policyData.data_filter.encoded_query,
        "policyTypeId": api.state.policyData.general_info.cmdb_policy_type
    });

    api.data.get_certification_selected_fields_lists.execute({
    "table": api.state.policyData.data_filter.table || api.state.defaultTable,
            "policyId": api.state.policyData.policyId
    });
}
