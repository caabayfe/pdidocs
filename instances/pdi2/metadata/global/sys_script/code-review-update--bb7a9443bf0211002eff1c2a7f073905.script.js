//This check would not fit on the condition line.  Only send message for finish stages. Do not do cancel because that has its own notification.
if (current.stage.changesTo('complete') || current.stage.changesTo('rejected') || current.stage.changesTo('collided') || current.stage.changesTo('complete_with_errors') || current.stage.changesTo('rejected_invalid_scope')) {

//Do not add an event if one is already added
var event = new GlideRecord("sysevent");
event.addQuery("instance", current.sys_id);
event.addQuery("name", "codereview.update");
event.query();
	if (!event.next()) {
		var userId = "";
		var userRec = new GlideRecord("sys_user");
		userRec.addQuery("user_name", current.sys_created_by);
		userRec.query();
		if(userRec.next())
			userId = userRec.getValue("sys_id");
			gs.eventQueue("codereview.update", current, userId, current.sys_created_by);
	}
}
