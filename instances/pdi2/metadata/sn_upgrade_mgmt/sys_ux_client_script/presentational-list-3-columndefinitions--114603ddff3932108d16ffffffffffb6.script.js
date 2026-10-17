/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	const translatedLabels = {
    "app_name":helpers.translateSync("Application"),
    "status": helpers.translateSync("Status"),
    "current_version": helpers.translateSync("Current Version")
  };

  const dependenciesColumnData = api.state.dependenciesColumnData;

  if (!dependenciesColumnData || !Array.isArray(dependenciesColumnData.columns)) {
    return { columns: [] }; // Fail-safe
  }

  const translatedColumns = dependenciesColumnData.columns.map(col => {
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
