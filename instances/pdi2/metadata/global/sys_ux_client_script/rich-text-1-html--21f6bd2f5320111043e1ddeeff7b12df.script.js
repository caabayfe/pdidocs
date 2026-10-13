/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  var feedback = api.data.grab_feedback.results[0].value.displayValue;
  var val = api.data.grab_server_status.results[0].value.displayValue;
  var res = feedback.toString();
  var txt;
  switch (true) {
    case (val == "NO_ENDPOINT"):
      txt = "Unable to establish a connection to MetricBase. Please check your configuration.";
      break;
    case (val == "OFFLINE"):
      txt = "The MetricBase client is offline.";
      break;
    case (feedback == "1+ Instances Online"):
      txt = "At least one MetricBase client is available.";
      break;
    case (val == "HA_UNAVAILABLE"):
      txt = "A high availabilty client is unavailable.";
      break;
    case (feedback != "GOOD"):
      txt = "The MetricBase client is not properly configured. Please check your configuration.";
      break;
    default:
      txt = "Everything is up and running!";
      break;
  }
  return txt;
}
