/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const translatedLabels = {
    "app_name":helpers.translateSync("Application"),
     "status": helpers.translateSync("Status"),
    "current_suite": helpers.translateSync("Current Version"),
    "latest_suite": helpers.translateSync("Latest Version"),
    "selected_suite": helpers.translateSync("Selected Version")
  };

  const gcColumnData = api.state.gcColumnData;

  if (!gcColumnData || !Array.isArray(gcColumnData.columns)) {
    return { columns: [] }; // Fail-safe
  }

  const translatedColumns = gcColumnData.columns.map(col => {
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
