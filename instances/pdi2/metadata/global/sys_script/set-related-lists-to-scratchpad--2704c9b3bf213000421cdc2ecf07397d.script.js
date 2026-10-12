// If navigate to existing app editor form then set the appId and its its related tables to the scratchpad
// If create app form then set the appId on the scratchpad to nil
var lists = [];
// get the related list entries on this page
var relatedList = new GlideRecord('sys_ui_related_list_entry');
relatedList.addQuery('list_id.name', current.getTableName());
relatedList.query();
while(relatedList.next())
    lists.push(relatedList.related_list.toString());

// add related lists and current app id to scratchpad
g_scratchpad.app_related_lists = {
    appId: !current.isNewRecord() ? current.sys_id.toString() : "",
    lists: lists
};

//Need to know if related lists are deferred or not
g_scratchpad.deferred_list = gs.getProperty('glide.ui.defer_related_lists');
