var user = producer.role_delegator_user.getDisplayValue();
var group = producer.role_delegator_group.getDisplayValue();
var url = current.getLink();

current.short_description = "Grant role delegator role to " + user + " in the " + group + " group";
gs.addInfoMessage(gs.getMessage("Change Request: <a href='{0}'>{1}</a> opened for your request to grant role delegation rights to user: {2} in group: {3}", [url, current.number, user, group]));

current.assignment_group = producer.role_delegator_group;
current.work_start = new GlideDateTime();
current.work_end = new GlideDateTime();

// redirect back here
producer.redirect = "com.glideapp.servicecatalog_cat_item_view.do?sysparm_id=01205b180a0a0b3000b6efd641d24b75";

var incRPUtil = new LinkRecordProducerToIncident();
incRPUtil.linkRecordProducerToParentIncident(RP.getParameterValue('sysparm_parent_sys_id'), current);
