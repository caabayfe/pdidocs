var evt = new GlideRecord('sysevent');
evt.initialize();
var guest = new GlideRecord('sys_user');
guest.addActiveQuery();
guest.addQuery('user_name', 'guest');
guest.query();

if (guest.next()) {
	evt.user_id = guest.sys_id;
	evt.user_name = guest.user_name;
}
evt.process_on = gs.nowDateTime();
evt.name = "email.read";
evt.parm1 = current.sys_id;
evt.insert();
gs.addInfoMessage(gs.getMessage('Event created to reprocess email "{0}"',Packages.org.apache.commons.lang.StringEscapeUtils.escapeXml(current.subject)));

if (current.type == 'received-ignored') {
  current.type = "received";
  current.update();
}
