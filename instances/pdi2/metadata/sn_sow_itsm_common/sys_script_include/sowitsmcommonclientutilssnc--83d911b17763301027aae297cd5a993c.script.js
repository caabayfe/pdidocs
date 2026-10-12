var SOWITSMCommonClientUtilsSNC = Class.create();
SOWITSMCommonClientUtilsSNC.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    initialize: function(request, responseXML, gc) {
        global.AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
    },

    TABLES: {
        SYS_USER_GRMEMBER: 'sys_user_grmember',
        SYS_USER: 'sys_user'
    },

    getMemberGroups: function(userSysID) {
        if (userSysID === undefined)
            userSysID = this.getParameter('userSysID');
        return JSON.stringify(this._getMemberGroups(userSysID));
    },

    _getMemberGroups: function(userSysID) {
        if (!userSysID)
            return;
        var memberGroups = [];
        var pm = new GlidePluginManager();
        var grMembers = new GlideRecord(this.TABLES.SYS_USER_GRMEMBER);
        grMembers.addQuery('group.active', 'true');
        grMembers.addQuery('user', userSysID);
        grMembers.addEncodedQuery('group.typeISEMPTY^ORgroup.typeLIKE1cb8ab9bff500200158bffffffffff62'); 
        grMembers.query();
        while (grMembers.next()) {
            memberGroups.push({
                sys_id: grMembers.group + '',
                displayName: grMembers.group.getDisplayValue()
            });
        }
        if (pm.isActive("com.snc.wfo") && memberGroups.length > 1) {
            var gr = new GlideRecord(this.TABLES.SYS_USER);
            if (gr.get(userSysID) && gr.primary_group) {
                memberGroups = [];
                memberGroups.push({
                    sys_id: gr.primary_group + '',
                    displayName: gr.primary_group.getDisplayValue()
                });
            }
        }
        return memberGroups;
    },

    type: 'SOWITSMCommonClientUtilsSNC'
});
