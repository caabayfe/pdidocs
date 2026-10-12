async function handler({ api, event, helpers, imports }) {
  const { SUCCESS_NOTIFICATION_PROPS, showNotificationWithAutoClose } =
    imports["sn_cmdb_ws.CMDBWsNotificationUtil"]();
  var totalRecordsAdded = api.state.excludeRowSelection.selectionCount;

    let messageSinglular =  await helpers.translate("1 record added to exclusion list", totalRecordsAdded);
    let messagePlural = await helpers.translate("{0} records added to exclusion list", totalRecordsAdded);
    let messageContent = ( totalRecordsAdded > 1) ? messagePlural : messageSinglular;

  const notificationId = "successId" + new Date().valueOf();
  let notifications = [
    {
      ...SUCCESS_NOTIFICATION_PROPS,
      id: notificationId,
      content: messageContent,
    },
  ];

  showNotificationWithAutoClose({ api, helpers }, notifications);
  api.setState("refreshExclusionList", { timestamp: new Date() });

  api.data.getDataFilterEncodedQuery.execute({
    table: api.state.policyData.data_filter.table || api.state.defaultTable,
    encodedQuery: api.state.policyData.data_filter.encoded_query,
    policyTypeId: api.state.policyData.general_info.cmdb_policy_type,
  });

  api.data.get_data_manager_policy_review_info.execute({
    "policySysId": api.state.policyData.policyId
  });
}
