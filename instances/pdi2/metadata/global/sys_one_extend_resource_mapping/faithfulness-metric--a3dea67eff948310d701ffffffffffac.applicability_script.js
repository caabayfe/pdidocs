(function(currentInputs, context) {
 /* customize condition logic here, return true or false */
  var featureInput = currentInputs; 
  if (typeof featureInput === "string") {
 featureInput = JSON.parse(featureInput);
    }

    var metrics = featureInput && featureInput._meta && featureInput._meta.evaluationDetails && featureInput._meta.evaluationDetails.metrics;

    return metrics && metrics.indexOf("63015aeda3920210883c25d1d71e6124") !== -1; //check for capability id of the metric
})(currentInputs, context);
