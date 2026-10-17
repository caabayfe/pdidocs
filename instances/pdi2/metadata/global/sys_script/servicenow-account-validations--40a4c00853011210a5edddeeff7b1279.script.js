(function executeRule(current, previous /*null when async*/ ) {
    var snOwnedDomains = gs.getProperty("glide.email_accounts.servicenow_domains", "servicenowlab.com,dev.servicenowlab.com,test.servicenowlab.com,ifsdev.servicenowlab.com,servicenowdevelopers.com,service-now.com,sg.service-now.com,servicenowservices.com,servicenowcloud.mil,servicenowcloud.com,servicenowcloud.com.au,servicenowcloud.com.sg");
    var snOwnedDomainsList = snOwnedDomains.toLowerCase().split(",");

    function emailAddressHasSNDomain(emailAddress, snDomains) {
		emailAddress = (emailAddress || "").trim();
		var indexOfAt = emailAddress.lastIndexOf("@");
		var emailDomain = emailAddress.substring(indexOfAt + 1);
        for (var i = 0; i < snDomains.length; i++) {
            if (snDomains[i] == emailDomain) {
                return true;
            }
        }
        return false;
    }
	var userName = (current.getValue("user_name") || "").toLowerCase();
	var from = (current.getValue("from") || "").toLowerCase();
	//check both user_name and from address have servicenow owned domain
    if (emailAddressHasSNDomain(userName, snOwnedDomainsList) &&  from && emailAddressHasSNDomain(from, snOwnedDomainsList)) {
        
		var indexOfAt = from.lastIndexOf("@");
		var firstPart = from.substring(0, indexOfAt);
		//verify "from" first part is instance_name.
		var instanceName = gs.getProperty("instance_name").toLowerCase();
		if ((indexOfAt > 1) && (instanceName != firstPart )) {
			gs.addErrorMessage(gs.getMessage("'From address' is invalid."));
			current.setAbortAction(true);
			gs.setRedirectURL(current);
		}
    }
})(current, previous);
