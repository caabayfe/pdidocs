// The display business rule on sys_app "Set Related Lists To Scratchpad" will package to g_scratchpad the object app_related_lists.
// This object has the current application id and the related lists ids. 
// Use this metadata to listen to the save event on each related list in order to package the application id on the ajax request
function onLoad() {

    if (g_scratchpad.deferred_list == "true") {
        CustomEvent.observe('related_lists.ready', acRelatedListHandler);
    } else {
        acRelatedListHandler();
    }
}

function acRelatedListHandler() {
    if (g_scratchpad.app_related_lists) {
        var appId = g_scratchpad.app_related_lists.appId;
        var appRelatedListEdit = new AppRelatedListEdit(appId);
        var lists = g_scratchpad.app_related_lists.lists;
        var numLists = lists.length;
        for (var i = 0; i < numLists; i++) {
            var table = gel("sys_app." + lists[i] + "_table");
            if (table != null)
                Event.observe(table, 'glide:list_v2.edit.save', appRelatedListEdit.callback.bind(appRelatedListEdit));
        }
    }
}

var AppRelatedListEdit = function(appId) {
    this.init(appId);
};
AppRelatedListEdit.prototype = {
    init: function(appId) {
        this.appId = appId;
    },
    callback: function(evt) {
        evt.memo.ajax.setProcessor('com.snc.apps.ui.list.AJAXAppRelatedListEdit');
        evt.memo.ajax.addParam('sysparm_sys_app', this.appId);
    }
}
