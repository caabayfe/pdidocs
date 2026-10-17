data.subscribeMessage = gs.getMessage("You subscribed to receive updates for this service");
data.unsubscribeMessage = gs.getMessage("You unsubscribed receiving updates for this service");
data.canInsertSubscription = false;
data.canDeleteSubscription = false;
data.canReadSubscription = false;

var permCheck = new GlideRecordSecure('m2m_sp_status_subscription');
data.canInsertSubscription = permCheck.canCreate() && permCheck.canWrite();
data.canDeleteSubscription = permCheck.canDelete();
data.canReadSubscription = permCheck.canRead();

if (typeof input != "undefined") {
	if (input.action == "subscribe" && data.canInsertSubscription) {
		var sub = new GlideRecordSecure("m2m_sp_status_subscription");
		sub.addQuery("sys_user", gs.getUserID());
		sub.addQuery("cmdb_ci_service", input.serviceID);
		sub.query();
		if (!sub.next()) {
			sub.sys_user = gs.getUserID();
			sub.cmdb_ci_service = input.serviceID;
			sub.insert();
		}
		gs.addInfoMessage(data.subscribeMessage);
	}
	else if (input.action == "unsubscribe" && data.canDeleteSubscription) {
		var sub = new GlideRecordSecure("m2m_sp_status_subscription");
		sub.addQuery("sys_user", gs.getUserID());
		sub.addQuery("cmdb_ci_service", input.serviceID);
		sub.query();
		while (sub.next())
			sub.deleteRecord();
		gs.addInfoMessage(data.unsubscribeMessage);
	}	
}

data.serviceID = (input && input.serviceID) || $sp.getParameter("service");
var service = new GlideRecordSecure("cmdb_ci_service");
if (service.get(data.serviceID) && data.canReadSubscription) {
	var sub = new GlideRecordSecure("m2m_sp_status_subscription");
	sub.addQuery("sys_user", gs.getUserID());
	sub.addQuery("cmdb_ci_service", data.serviceID);
	sub.query();
	data.subscriber = sub.hasNext();
} else
	data.serviceID = null;

data.loggedIn = gs.isLoggedIn();
