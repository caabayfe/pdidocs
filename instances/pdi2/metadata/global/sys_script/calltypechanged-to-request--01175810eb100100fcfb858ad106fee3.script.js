var reqFor = current.caller;
var contactType = current.contact_type;
var location = current.caller.location;
var reqItem = current.request_item;
var comments = "NEW_CALL_REF:" + current.sys_id + " " + current.description;

var url = "com.glideapp.servicecatalog_cat_item_view.do?sysparm_id=" + reqItem
	+ "&sysparm_requested_for=" + GlideStringUtil.urlEncode(reqFor)
	+ "&sysparm_location=" + GlideStringUtil.urlEncode(location)
	+ "&sysparm_special_instructions=" + GlideStringUtil.urlEncode(comments)
	+ "&sysparm_stack=" + current.getLink()
	+ "&sysparm_contact_type=" + contactType;
action.setRedirectURL(url);
current.isNavigateToCatalog = true;
