var SidebarChatUtils = Class.create();
SidebarChatUtils.prototype = Object.extendsObject(SidebarChatUtilsSNC, {
    initialize: function() {
        SidebarChatUtilsSNC.prototype.initialize.call(this);
    },

    type: 'SidebarChatUtils'
});
