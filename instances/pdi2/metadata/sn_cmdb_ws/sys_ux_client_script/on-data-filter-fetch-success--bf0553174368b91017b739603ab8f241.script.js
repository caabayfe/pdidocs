async function script({ api, event, helpers, imports }) {
  const { cloneDeep } = imports["sn_cmdb_ws.CmdbWsCloneUtil"]();
  const { DM_POLICY_TYPE_IDS } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
  const filtersText = await helpers.translate("Filters");
  const RECORDS = await helpers.translate("Records");
  const enforcedConditionsText = await helpers.translate("Enforced conditions");
  const tableText = await helpers.translate("Table");
  const {
    enforced_condition,
    enforced_condition_display,
    encoded_query,
    list_filter,
    excl_list_filter,
    table,
    recordCount,
    excludedCount,
    tableLabel,
    isCMDBTable,
    overlap_message,
  } = event?.payload?.data?.output;
  var tabArray;
  const includedRecordsColumns = isCMDBTable ? "name,sys_class_name,short_description,life_cycle_stage,sys_updated_on" : "";

  if (
    api?.state?.policyData?.general_info?.cmdb_policy_type !=
      DM_POLICY_TYPE_IDS.DELETE_RELATED_ENTRY &&
    api?.state?.policyData?.general_info?.cmdb_policy_type !=
      DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION
  ) {
    tabArray = [
      {
        fields: {
          table,
          list_filter,
          columns: includedRecordsColumns
        },
        count: recordCount + (recordCount == 100000 ? "+" : "") || "",
        label: await helpers.translate("Included records"),
        timestamp: new Date().getTime(),
        action: "exclude",
        buttonLabel: await helpers.translate("Exclude records"),
        buttonTooltip: await helpers.translate(
          "Exclude the selected records from this policy type"
        ),
        disableButton: true,
        headerText: await helpers.translate(
          "Select records to exclude from this policy and add them to list of excluded records."
        ),
        isDeleteRelatedEntry: false,
        isCertification: false,
      },
      {
        fields: {
          table: "cmdb_policy_ci_exclusion_list",
          list_filter: excl_list_filter,
          view: "cmdb_ws",
        },
        count: excludedCount || "",
        label: await helpers.translate("Excluded records"),
        timestamp: new Date().getTime(),
        action: "include",
        buttonLabel: await helpers.translate("Include records"),
        buttonTooltip: await helpers.translate(
          "Include the selected records from this policy type"
        ),
        disableButton: true,
        headerText: await helpers.translate(
          "These are the records you have selected to be excluded from this policy."
        ),
        isDeleteRelatedEntry: false,
        isCertification: false,
      },
    ];
  } else if (
    api?.state?.policyData?.general_info?.cmdb_policy_type ==
    DM_POLICY_TYPE_IDS.DELETE_RELATED_ENTRY
  ) {
    tabArray = [
      {
        fields: {
          table,
          list_filter,
          columns: includedRecordsColumns
        },
        count: recordCount || "",
        label: await helpers.translate("Included records"),
        timestamp: new Date().getTime(),
        action: "exclude",
        buttonLabel: await helpers.translate("Exclude records"),
        buttonTooltip: await helpers.translate(
          "Exclude the selected records from this policy type"
        ),
        disableButton: true,
        headerText: await helpers.translate(
          "Select records to exclude from this policy and add them to list of excluded records."
        ),
        isDeleteRelatedEntry: true,
        isCertification: false,
      },
    ];
  } else if (
    api?.state?.policyData?.general_info?.cmdb_policy_type ==
    DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION
  ) {
    tabArray = [
      {
        fields: {
          table,
          list_filter,
          columns: includedRecordsColumns
        },
        count: recordCount || "",
        label: await helpers.translate("Included records"),
        timestamp: new Date().getTime(),
        disableButton: true,
        isDeleteRelatedEntry: false,
        isCertification: true,
      },
    ];
  }

  if (api.state.listProps) {
    let newListProps = {};
    if (api.state.listProps.type == "excluded_records") {
      newListProps.table = "cmdb_policy_ci_exclusion_list";
      newListProps.list_filter = excl_list_filter;
      newListProps.columns = "";
      newListProps.view = "cmdb_ws";
      newListProps.type = "excluded_records";
    } else {
      newListProps.table = table;
      newListProps.list_filter = list_filter;
      newListProps.columns = includedRecordsColumns;
      newListProps.view = "cmdb_ws";
      newListProps.type = "included_records";
    }
    api.setState("listProps", newListProps);
  }

  api.setState("dataFilterTabArray", tabArray);
  api.setState("hideDataFilterList", false);
  api.setState("enforcedCondition", enforced_condition);
  api.setState("impactedRecordCount", recordCount);

  if (api.state.policyData.data_filter) {
    const { policyData } = api.state;
    policyData.data_filter.table = table;
    policyData.data_filter.encoded_query = encoded_query;
    api.setState("policyData", cloneDeep(policyData));
  }

  if (overlap_message) {
    api.emit("NOW_UXF_PAGE#ADD_NOTIFICATIONS", {
      items: [
        {
          id: "overlap_retirement_definitions",
          status: "info",
          icon: "info-circle-outline",
          content: await helpers.translate(
            "There are multiple enforced retirement definitions that affect this policy. When the policy is evaluated the number of affected records and tasks may be different."
          ),
          action: { type: "dismiss" },
        },
      ],
    });
    helpers.timing.setTimeout(() => {
      api.emit("NOW_UXF_PAGE#REMOVE_NOTIFICATIONS", {
        items: [{ id: "overlap_retirement_definitions" }],
      });
    }, 5000);
  }

  // trigger fetch of the display value for enforced condition. This needs to be fetched separately as its not allowed in scope.
  helpers
    .snHttp(
      "/api/now/cmdb_workspace_api/encodedquery?table=" +
        table +
        "&query=" +
        enforced_condition_display,
      {
        method: "GET",
        batch: false,
      }
    )
    .then(function ({ response }) {
      if (response.result && response.result.errors.length === 0) {
        const enforcedConditionLabel = response.result.encodedQueryDisplayValue;
        helpers
          .snHttp(
            "/api/now/cmdb_workspace_api/encodedquery?table=" +
              table +
              "&query=" +
              encoded_query,
            {
              method: "GET",
              batch: false,
            }
          )
          .then(function ({ response }) {
            if (response.result && response.result.errors.length === 0) {
              const encodedQueryLabel =
                response.result.encodedQueryDisplayValue;

              api.setState("encodedQueryDisplayValue", {
                label:
                  tableText +
                  " = " +
                  tableLabel +
                  (encodedQueryLabel
                    ? " > " + filtersText + " = " + encodedQueryLabel + " "
                    : ""),
                enforcedConditionLabel: enforcedConditionLabel
                  ? enforcedConditionLabel
                  : "",
              });
            }
          });
      }
    });

  const { cmdb_policy_type } = api?.state?.policyData?.general_info;
  // trigger fetch of the policy included and excluded records aggregate counts.This is fetched separately for performance purpose.
  helpers
    .snHttp(
      "/api/sn_cmdb_ws/cmdb_workspace_api_scoped/policy_aggregate_count",
      {
        method: "POST",
        batch: false,
        body: {
          table: table,
          list_filter: list_filter,
          policyTypeId: cmdb_policy_type,
          excl_list_filter: excl_list_filter,
        },
      }
    )
    .then(function ({ response }) {
      if (response.result) {
        const aggregateRecordCount = response.result.recordCount;
        const aggregateExcludedCount = response.result.excludedCount;
        var updatedFirstTab, updatedSecondTab, updatedTabs;
        if (
          api?.state?.policyData?.general_info?.cmdb_policy_type !=
            DM_POLICY_TYPE_IDS.DELETE_RELATED_ENTRY &&
          api?.state?.policyData?.general_info?.cmdb_policy_type !=
            DM_POLICY_TYPE_IDS.NON_LIFECYCLE.CERTIFICATION
        ) {
          var firstTab = tabArray[0];
          var secondTab = tabArray[1];
          updatedFirstTab = {
            ...firstTab,
            count: aggregateRecordCount || "",
          };
          updatedSecondTab = {
            ...secondTab,
            count: aggregateExcludedCount || "",
          };
          updatedTabs = [updatedFirstTab, updatedSecondTab];
        } else {
          var firstTab = tabArray[0];
          updatedFirstTab = {
            ...firstTab,
            count: aggregateRecordCount || "",
          };
          updatedTabs = [updatedFirstTab];
        }
        api.setState("dataFilterTabArray", updatedTabs);
        api.setState("impactedRecordCount", aggregateRecordCount);
        const recordScoreJson = [
          {
            data: [
              {
                value: aggregateRecordCount,
              },
            ],
            metadata: {
              dataSourceLabel:
                RECORDS.charAt(0).toUpperCase() + RECORDS.slice(1),
            },
          },
        ];
        api.setState("recordsScorecardData", recordScoreJson);
      }
    });
}
