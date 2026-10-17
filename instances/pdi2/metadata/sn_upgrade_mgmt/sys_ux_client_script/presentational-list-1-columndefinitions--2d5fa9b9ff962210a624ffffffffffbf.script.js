/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const translatedLabels = {
    "app_name":helpers.translateSync("Application"),
    "current_version": helpers.translateSync("Current Version"),
    "latest_version": helpers.translateSync("Latest Version"),
    "upgrade_version": helpers.translateSync("Upgrade Version"),
    "state": helpers.translateSync("State"),
    "status_message": helpers.translateSync("Status Message")
  };

  const columnData = api.state.columnData;

  if (!columnData || !Array.isArray(columnData.columns)) {
    return { columns: [] }; // Fail-safe
  }

  const translatedColumns = columnData.columns.map(col => {
    return {
      ...col,
      label: translatedLabels[col.key] || col.label // fallback to original label
    };
  });

  return {
    columnHeaderTextTooltip: '',
    columns: translatedColumns
  };
}
