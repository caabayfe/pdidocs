/**
* @param {params} params
* @param {api} params.api
* @param {event} params.event
* @param {imports} params.imports
* @param {helpers} params.helpers
*/
function showOnloadAlerts({ api, event, helpers, imports }) {
  var paramsString = api.context.props.inputExtraParams,
    paramsObj = paramsString?.split('/'),
    alerts;

  if (!paramsObj || !paramsObj.length || (paramsObj.indexOf('alerts') < 0)) return;

  alerts = paramsObj[paramsObj.indexOf('alerts') + 1];
  try {
    alerts = JSON.parse(alerts);
  } catch (e) { }

  if (!alerts)
    return;
  if (typeof alerts == 'string') {
    alerts = [{
      id: "record-alert-1",
      status: "info",
      icon: "info-circle-outline",
      content: alerts,
      action: {
        type: "dismiss"
      }
    }];
  }
    api.emit('SRP_UI_CTRL#ADD_NOTIFICATIONS', {
      items: alerts
    });
// this needs to be changed
  // helpers.timing.setTimeout(() => {
  //   api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
  //     items: alerts
  //   });
  // }, 1000);

}
