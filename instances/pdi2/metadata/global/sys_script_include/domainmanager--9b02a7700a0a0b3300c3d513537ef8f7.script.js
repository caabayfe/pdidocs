gs.include("PrototypeServer");

var DomainManager = Class.create();
DomainManager.prototype = {
    initialize: function() {},

    // A new entry was added to the sys_user_group_visibility table
    addInheritedDomains: function( /* GlideRecord */ groupDomain) {
        var ug = new GlideUserGroup();
        var members = ug.getMembers(groupDomain.group);
        while (members.next()) {
            gs.addInfoMessage(gs.getMessage("Granting domain: {0} to: {1}", [groupDomain.sys_domain.getDisplayValue(), members.user.name]));
            var vis = new GlideRecord('sys_user_visibility');
            vis.user = members.user;
            vis.sys_domain = groupDomain.sys_domain;
            vis.inherited = true;
            vis.granted_by = groupDomain.group;
            vis.insert();
        }
    },

    // Entry deleted from the sys_user_group_visibility table
    removeInheritedDomains: function( /* GlideRecord */ groupDomain) {
        var gr = new GlideRecord('sys_user_visibility');
        gr.initialize();
        gr.addQuery('granted_by', groupDomain.group);
        gr.addQuery('sys_domain', groupDomain.sys_domain);
        this.deleteRecords(gr);
        gs.addInfoMessage(gs.getMessage('Delete domain: {0}, granted by: {1}', [groupDomain.sys_domain.getDisplayValue(), groupDomain.group.name]));
    },

    // A new user was added to a group
    groupMemberAdd: function(groupMember) {
        this.addGroupDirect(groupMember.group, groupMember.user);
        this.expandGroupVisibility(groupMember.group, groupMember.user);
    },

    expandGroupVisibility: function(groupID, userID) {
        var usergr = new GlideRecord('sys_user');
        if (!usergr.get(userID))
            return;

        var groupgr = new GlideRecord('sys_user_group');
        if (!groupgr.get(groupID))
            return;

        var domains = new GlideRecord('sys_user_group_visibility');
        domains.addQuery('group', groupID);
        domains.queryNoDomain();
        while (domains.next()) {
            gs.addInfoMessage(gs.getMessage("expandGroupVisibility: Granting domain: {0} to user: {1}", [domains.sys_domain.getDisplayValue(), usergr.name]));
            var vis = new GlideRecord('sys_user_visibility');
            vis.sys_domain = domains.sys_domain;
            vis.user = userID;
            vis.granted_by = groupID;
            vis.inherited = true;
            vis.reason = "Visibility from group " + groupgr.name;
            vis.insert();
        }
    },

    // A user was removed from a group
    groupMemberDelete: function(groupMember) {
        var gr = new GlideRecord('sys_user_visibility');
        gr.initialize();
        gr.addQuery('granted_by', groupMember.group);
        gr.addQuery('user', groupMember.user);
        this.deleteRecords(gr);
        gs.addInfoMessage(gs.getMessage('Domains deleted for: {0}, group: {1}', [groupMember.user.name, groupMember.group.name]));
    },

    deleteRecords: function(gr) {
        gr.queryNoDomain();
        while (gr.next()) {
            this.deleteDomain(gr);
            gr.setWorkflow(false);
            gr.deleteRecord();
        }
    },

    // Support for included domains from here down

    // Called when a domain is added to another domain (insert into domain_contains table)
    //
    addIncludedDomain: function( /* GlideRecord */ inclusion) {
        var master = inclusion.domain;
        var contains = inclusion.contains;
        var expand = new GlideRecord('sys_user_visibility');
        expand.addQuery('sys_domain', master);
        expand.queryNoDomain();
        while (expand.next()) {
            gs.addInfoMessage(gs.getMessage('addIncludedDomain: Adding Domain {0} to {1}', [inclusion.contains.getDisplayValue(), expand.user.name]));
            var newDomain = new GlideRecord('sys_user_visibility');
            newDomain.user = expand.user;
            newDomain.sys_domain = contains;
            newDomain.inherited = true;
            newDomain.parent_visibility = expand.sys_id;
            newDomain.domain_contains_instance = inclusion.sys_id;
            newDomain.reason = "Contained in domain " + inclusion.domain.getDisplayValue();
            newDomain.insert();
        }
    },

    // Called when a domain is removed from another domain (delete from domain_contains table)
    // 
    removeIncludedDomain: function( /* GlideRecord */ inclusion) {
        var expand = new GlideRecord('sys_user_visibility');
        expand.addQuery('domain_contains_instance', inclusion.sys_id);
        expand.queryNoDomain();
        while (expand.next()) {
            gs.addInfoMessage(gs.getMessage('Removing Domain {0} from {1}', [inclusion.contains.getDisplayValue(), expand.user.name]));
            expand.setWorkflow(false);
            expand.deleteRecord();
        }
    },

    // Called when a domain is added to the sys_user_visibility table.
    // Responsible for expanding (adding) any domains contained within the domain in question
    expandDomain: function( /* GlideRecord */ sys_user_visibility) {
        gs.log("Expansion sys_user_visibility:" + sys_user_visibility.sys_domain.getDisplayValue() + ":" + sys_user_visibility.user.name);
        var topLevel = false;
        if (typeof VISIBILITY == 'undefined' || VISIBILITY == null) {
            topLevel = true;
            VISIBILITY = new Object();
        }
        var key = sys_user_visibility.sys_domain + '';
        VISIBILITY[key] = true;
        var expansion = new GlideRecord('domain_contains');
        expansion.addQuery('domain', sys_user_visibility.sys_domain);
        expansion.query();
        while (expansion.next()) {
            var childkey = expansion.contains + '';
            if (VISIBILITY[childkey]) {
                gs.addInfoMessage(gs.getMessage('Skipping recursive domain addition'));
                continue;
            }
            gs.addInfoMessage(gs.getMessage('expandDomain: Adding domain {0} to {1}', [expansion.contains.getDisplayValue(), sys_user_visibility.user.name]));
            var newDomain = new GlideRecord('sys_user_visibility');
            newDomain.user = sys_user_visibility.user;
            newDomain.sys_domain = expansion.contains;
            newDomain.parent_visibility = sys_user_visibility.sys_id;
            newDomain.domain_contains_instance = expansion.sys_id;
            newDomain.inherited = true;
            newDomain.reason = "Contained in domain " + sys_user_visibility.sys_domain.getDisplayValue();
            newDomain.insert();
        }
        if (topLevel)
            VISIBILITY = null;
    },

    // Called when a domain is deleted from the sys_user_visibility table.
    deleteDomain: function( /* GlideRecord */ sys_user_visibility) {
        gs.log("Deletion sys_user_visibility:" + sys_user_visibility.sys_domain.getDisplayValue() + ":" + sys_user_visibility.user.name);
        var sysIDs = [];
        sysIDs.push(sys_user_visibility.sys_id);
        this.getContainedDomains(sysIDs, sys_user_visibility.sys_id);

        var kids = new GlideRecord('sys_user_visibility');
        kids.addQuery('sys_id', 'IN', sysIDs);
        kids.queryNoDomain();
        while (kids.next()) {
            gs.addInfoMessage(gs.getMessage('Removing domain {0} from {1}', [kids.sys_domain.getDisplayValue(), kids.user.name]));
            kids.setWorkflow(false);
            kids.deleteRecord();
        }
    },

    getContainedDomains: function(sysIDs, parentId) {
        var kids = new GlideRecord('sys_user_visibility');
        kids.addQuery('parent_visibility', parentId);
        kids.queryNoDomain();
        var currentLevelIDs = [];
        while (kids.next()) {
            var currentId = kids.getUniqueValue();
            sysIDs.push(currentId);
            currentLevelIDs.push(currentId);
        }
        for (var i = 0; i < currentLevelIDs.length; i++) {
            this.getContainedDomains(sysIDs, currentLevelIDs[i]);
        }
    },

    // Serious stuff here.  The customer has changed the set of values used for
    // domains.  Perhaps changing from groups to companies
    // Must clear out all values and perhaps add new ones
    //
    domainSetChange: function(domainTable) {
        var domain = new GlideRecord('sys_user_visibility');
        this.deleteRecords(domain);
        if (domainTable == 'sys_user_group')
            this.initGroupDomains();
    },

    initGroupDomains: function() {
        var groups = new GlideRecord('sys_user_group');
        groups.query();
        while (groups.next())
            this.addGroupDomainToMembers(groups);
    },

    addGroupDomainToMembers: function(group) {
        var ug = new GlideUserGroup();
        var members = ug.getMembers(group.sys_id.toString());
        while (members.next()) {
            gs.addInfoMessage(gs.getMessage("addGroupDomainToMembers: Granting domain: {0} to: {1}", [group.getDisplayValue(), members.user.name]));
            this.addGroupDirect(group.sys_id, members.user);
            this.expandGroupVisibility(group.sys_id, members.user);
        }
    },

    addGroupDirect: function(group, user) {
        var domainTable = GlideDomainSupport.getDomainTable();
        if (domainTable != 'sys_user_group')
            return;

        var groupgr = new GlideRecord('sys_user_group');
        if (!groupgr.get(group))
            return;

        var vis = new GlideRecord('sys_user_visibility');
        vis.user = user;
        vis.sys_domain = group;
        vis.inherited = true;
        vis.granted_by = group;
        vis.reason = "Member of group " + groupgr.name;
        vis.insert();
    },

    z: function() {}
}
