(function executeRule(current, previous /*null when async*/) {
	var propValue = current.value;
	var propName = current.name;
	var prevValue = previous.value;
	
	this.fingerprintValidityDefaultVal = 8;
	this.fingerprintValidityMinVal = 1;
	this.fingerprintValidityMaxVal = 24;

	this.maxRememberedBrowserDefaultVal = 5;
	this.maxRememberedBrowserMinVal = 1;
	this.maxRememberedBrowserMaxVal = 10;
	
	if(propName == "glide.authenticate.multifactor.browser.fingerprint.validity"){
		propValue = validateMFABrowserCookieSpanInHours(propValue, prevValue);
		if(prevValue != propValue){
			//update auto flush job definition
			updateAutoFlushRecord(propValue*60*60);
		}
	} else if(propName == "glide.authenticate.multifactor.remembered.browser.max.count")
		propValue = validateMFAMaxRememberedBrowsers(propValue, prevValue);

	current.value = String(parseInt(propValue));
})(current, previous);

function validateMFABrowserCookieSpanInHours(fpValidityInHours, prevValue){
	if (fpValidityInHours == '' || isNaN(fpValidityInHours)) {
		if(!isNaN(prevValue)){
			gs.addInfoMessage(gs.getMessage("Invalid value of browser fingerprint validity; retained existing value: {0} hours", prevValue));
			return prevValue;
		}
		gs.addInfoMessage(gs.getMessage("Invalid value of browser fingerprint validity; replaced with default value: {0} hours", this.fingerprintValidityDefaultVal));
		return this.fingerprintValidityDefaultVal;
	} else if (fpValidityInHours < this.fingerprintValidityMinVal) {
		gs.addInfoMessage(gs.getMessage("Browser fingerprint validity cannot be less than {0} hour; replaced with minimum allowed value: {0} hour", this.fingerprintValidityMinVal));
		return this.fingerprintValidityMinVal;
	} else if (fpValidityInHours > this.fingerprintValidityMaxVal) {
		gs.addInfoMessage(gs.getMessage("Browser fingerprint validity cannot be more than {0} hours; replaced with maximum allowed value: {0} hours", this.fingerprintValidityMaxVal));
		return this.fingerprintValidityMaxVal;
	}
	return fpValidityInHours;
}

function validateMFAMaxRememberedBrowsers(value, prevValue){
	if (value == '' || isNaN(value)) {
		if(!isNaN(prevValue)){
			gs.addInfoMessage(gs.getMessage("Invalid value of maximum number of remembered browsers per user; replaced with existing value: {0}", prevValue));
			return prevValue;
		}
		gs.addInfoMessage(gs.getMessage("Invalid value of maximum number of remembered browsers per user; replaced with default value: {0}", this.maxRememberedBrowserDefaultVal));
		return this.maxRememberedBrowserDefaultVal;
	} else if (value < this.maxRememberedBrowserMinVal) {
		gs.addInfoMessage(gs.getMessage("At least {0} browser per user must be allowed to remember; replaced with minimum allowed value: {0}", this.maxRememberedBrowserMinVal));
		return this.maxRememberedBrowserMinVal;
	} else if (value > this.maxRememberedBrowserMaxVal) {
		gs.addInfoMessage(gs.getMessage("More than {0} browsers per user cannot be remembered; replaced with maximum allowed value: {0}", this.maxRememberedBrowserMaxVal));
		return this.maxRememberedBrowserMaxVal;
	}
	return value;
}

function updateAutoFlushRecord(ageInSeconds){
	var gr = new GlideRecord("sys_auto_flush");
	if(gr.isValid()){
		gr.get("fa213ae073033300fdbd04fbc4f6a77e");
		gr.query();
		if(gr.next()){
			gr.age=ageInSeconds;
			gr.update();
			gs.log('Updated MFA browser fingerprint table auto flush job age to : '+ ageInSeconds + " seconds.");
		}
	}
}
