/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */

function evaluateProperty({ api, helpers, imports}) {
    var log = function(){}; try { log = imports['sn_upgrade_mgmt.UpgradeManagementUtils']().log; } catch(_e) {}
  var dateStr = api.data.check_if_bulk_app_update_session_in_progress.results[0]?._row_data?.displayValue;

  if (!dateStr) {
    return '';
  }

  // Extract only the date-time part
  var match = dateStr.match(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);

  if (!match) {
    log(api, "stylized_text_96/text", "Date not found in string", dateStr);
    return dateStr;
  }

  var isoString = match[0].replace(' ', 'T');
  var date = new Date(isoString);

  if (isNaN(date)) {
    log(api, "stylized_text_96/text", "Invalid date after parsing", isoString);
    return dateStr;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
