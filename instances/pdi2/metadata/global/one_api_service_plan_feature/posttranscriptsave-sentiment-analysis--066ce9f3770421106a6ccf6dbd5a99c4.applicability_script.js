(function(featureInput, previousFeatureOutputs) {  
	/* customize condition logic here, return true or false */  
	var featureInput = JSON.parse(featureInput);
	return featureInput.sentimentEnabled;
  })(featureInput, previousFeatureOutputs);
