function script({api, event}) {
    if (event.payload.id === 'dismiss_summary_button') {
      api.data.save_user_preference.execute({
          "name": "sn_cmdb_ws.dm.dismiss_summary",
          "value": true
      });
      api.setState("hideSummaryContainer", true);
    }
    else if (event.payload.id === 'import_cert_schedules_modal_close_button') {
      api.setState("importCertSchsModalState", "viewDraftPoliciesInfoMsg");
      api.setState("importCertSchsProgressPercent", 0);
      api.data.data_manager_get_cert_schedules_counts.refresh();
    }
}
