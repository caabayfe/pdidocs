(function(featureInput) {	
  	
    featureInput = JSON.parse(featureInput);
	// this is fetched from channel settings
    return featureInput.sentimentEnabled;
  
})(featureInput)
