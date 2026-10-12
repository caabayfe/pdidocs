function handler({api,event,imports}) {
  var paramsString = api.context.props.extraParams,
    paramsObj = paramsString?.split('/'),
    alerts;

  if (!paramsObj || !paramsObj.length || (paramsObj.indexOf('alerts') < 0)) return;

  alerts = paramsObj[paramsObj.indexOf('alerts') + 1];
  try {
    alerts = JSON.parse(alerts);
  } catch(e) {}

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
  api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
    items: alerts
  });
}
