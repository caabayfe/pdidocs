function ($timeout, spAriaUtil) {
	var c = this;	
	c.hide = false;
	c.submitted = false;
	
	c.action = function(state) {		
		c.submitted = true;
		c.data.state = state;
		c.data.response = c.data.submittingMsg;
		spAriaUtil.sendLiveMessage(c.data.response);
		c.server.update().then(c.hideIt);		
	}	
	
	c.hideIt = function() {
		spAriaUtil.sendLiveMessage(c.data.response);
		$timeout(function() {
			c.hide = true;
		}, 2000);
	}
	
	c.showPercentHelpful = function() {
		if (c.submitted)
			return false;
		
		if (c.data.percent < 0)
			return false;
		
		return c.options.hide_percent_helpful != true && c.options.hide_percent_helpful != "true";
	}
}
