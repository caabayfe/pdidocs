/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const trackers = api.data.get_schema_alter_tracker_1.output?.detail;
  if(trackers && trackers.length > 0) {
    return trackers[0].percentComplete || 0;
  } else {
    return 0;
  }
}
