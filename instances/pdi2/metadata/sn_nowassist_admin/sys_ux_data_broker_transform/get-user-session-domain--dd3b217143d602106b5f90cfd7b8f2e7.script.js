function transform(input) {
	try {
		var sessionDomainDetails = {
			domainId: "global",
			domainName: "Global"
		};

		sessionDomainDetails.domainId = gs.getSession().getCurrentDomainID() || "global";

        if(sessionDomainDetails.domainId && sessionDomainDetails.domainId !== "global") {
            sessionDomainDetails.domainName = NAADomainUtil.getDomainName(sessionDomainDetails.domainId);
        }
		
		return sessionDomainDetails;
	} catch(e) {
		gs.error("Failed to fetch the user session domain details - " + e);
		throw new Error("Failed to fetch the user session domain details");
	}
}
