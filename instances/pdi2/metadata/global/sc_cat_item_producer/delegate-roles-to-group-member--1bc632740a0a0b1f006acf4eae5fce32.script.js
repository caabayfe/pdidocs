var user = producer.delegate_roles_user.getDisplayValue();
var group = producer.delegate_roles_group.getDisplayValue();
var roles = producer.delegate_roles_roles.getDisplayValue();
var url = current.getLink();

current.short_description = "Delegate roles to " + user + " in the " + group + " group";
gs.addInfoMessage(gs.getMessage("Change Request: <a href='{0}'>{1}</a> opened for your request to delegate roles to user: {2} in group: {3}", [url, current.number, user, group]));

current.description = "Roles to be assigned: " + roles;
current.assignment_group = producer.delegate_roles_group;
current.close_code = "successful";
current.close_notes = "Roles have been applied";
current.work_start = new GlideDateTime();
current.work_end = new GlideDateTime();

producer.redirect = "com.glideapp.servicecatalog_cat_item_view.do?sysparm_id=1bc632740a0a0b1f006acf4eae5fce32";

var incRPUtil = new LinkRecordProducerToIncident();
incRPUtil.linkRecordProducerToParentIncident(RP.getParameterValue('sysparm_parent_sys_id'), current);
