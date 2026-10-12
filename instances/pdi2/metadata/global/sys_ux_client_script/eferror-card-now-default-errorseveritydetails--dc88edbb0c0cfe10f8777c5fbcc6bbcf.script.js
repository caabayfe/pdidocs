/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
  const severityLabelToColor = function (sev) {
    const priority_map = {
      Critical: 'critical',
      High: 'high',
      Medium: 'moderate',
      Low: 'low',
      Info: 'info',
    };
    return priority_map[sev];
  };

  const severityLabel = api.item.value.error_code._reference.severity_label.displayValue;
  const labelValue = severityLabel ? severityLabel : 'Low';

  return {
    Label: labelValue.trim(),
    color: severityLabelToColor(labelValue),
  };
}
