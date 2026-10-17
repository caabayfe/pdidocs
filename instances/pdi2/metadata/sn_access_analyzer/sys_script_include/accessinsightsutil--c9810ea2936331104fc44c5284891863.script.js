var AccessInsightsUtil = Class.create();
const INSIGHTS_ENABLED = 'glide.identity.aclanalyzer.access_insights_enabled';
const PEER_LEVEL_COLUMNS = 'glide.identity.aclanalyzer.access_insights_peer_level_columns';
const ORG_LEVEL = 'org';
const PEER_LEVEL = 'peer';
const GROUP_ENTITY_TYPE = 'group';
const ROLE_ENTITY_TYPE = 'role';
AccessInsightsUtil.prototype = {
    initialize: function() {},
    saveInsightsConfiguration: function({
        enabled,
        peerLevelColumns
    }) {
        if(!peerLevelColumns.includes('company')){
            return {
                errorCode: 'MISSING_DATA',
                errorMessage: 'Company attribute is madatory'
            }
        }
        var gr = new GlideRecord('sys_properties');
        gr.addQuery('sys_scope.name', 'Access Analyzer');
        gr.addQuery('name', 'IN', [INSIGHTS_ENABLED, PEER_LEVEL_COLUMNS]);
        gr.query();
        while (gr.next()) {
            if (gr.name == INSIGHTS_ENABLED) {
                gr.value = enabled;
            } else if (gr.name == PEER_LEVEL_COLUMNS) {
                gr.value = peerLevelColumns;
            }
            gr.update();
        }
    },

    loadInsightsConfiguration: function() {
        return {
            enabled: gs.getProperty(INSIGHTS_ENABLED) === 'true',
            peerLevelColumns: gs.getProperty(PEER_LEVEL_COLUMNS)
        };
    },

    getInsightsData: function(request) {
        let peerLevelColumnList = gs.getProperty(PEER_LEVEL_COLUMNS, 'department,manager,company').split(',');
        let orgLevelColumnList = ['company'];
        let currentUserGR = this._getUser(request.userId);
        let orgUsersCount = this._getUsersCount(orgLevelColumnList, currentUserGR);
        let peerUsersCount = this._getUsersCount(peerLevelColumnList, currentUserGR);
        let insights = [];
        insights.push(...this._getInsightsOnGroups(request.groups, currentUserGR, peerUsersCount, PEER_LEVEL, peerLevelColumnList));
        insights.push(...this._getInsightsOnGroups(request.groups, currentUserGR, orgUsersCount, ORG_LEVEL, orgLevelColumnList));
        insights.push(...this._getInsightsOnRoles(request.roles, currentUserGR, peerUsersCount, PEER_LEVEL, peerLevelColumnList));
        insights.push(...this._getInsightsOnRoles(request.roles, currentUserGR, orgUsersCount, ORG_LEVEL, orgLevelColumnList));
        return insights;
    },

    _getUser: function(userId) {
        let userGR = new GlideRecord('sys_user');
        userGR.addQuery('sys_id', userId);
        userGR.query();
        userGR.next();
        return userGR;
    },

    _getUsersCount(filterColumns, currentUserGR) {
        let userGR = new GlideAggregate('sys_user');
        userGR.addAggregate('COUNT');
        userGR.addQuery('active', true);
        if (filterColumns) {
            filterColumns.forEach(column => userGR.addQuery(column, currentUserGR.getValue(column)));
        }
        userGR.query();
        userGR.next();
        return userGR.getAggregate('COUNT');
    },

    _getInsightsOnGroups(groups, currentUserGR, totalUsersCount, insightType, insightColumns) {
        if (groups.length === 0) {
            return [];
        }
        let memberGA = this._getGroupMemberCount(groups, insightColumns, currentUserGR);
        let insights = this._getIntermidateInsightsObj(groups, GROUP_ENTITY_TYPE, insightType, totalUsersCount);
        let insightsMap = new Map();
        insights.forEach(insight => insightsMap.set(insight.entityId, insight));

        while (memberGA.next()) {
            const usersInGroupCount = memberGA.getAggregate('COUNT(DISTINCT', 'user');
            let insight = insightsMap.get(memberGA.group.toString());
            insight.usersInEntityCount = parseInt(usersInGroupCount);
        }
        return this._sortInsights(insights);
    },

    _getGroupMemberCount(groups, filterColumns, currentUserGR) {
        let memberGA = new GlideAggregate('sys_user_grmember');
        memberGA.addAggregate('COUNT(DISTINCT', 'user');
        memberGA.addQuery('group', 'IN', groups.map(group => group.id).toString());
        if (filterColumns) {
            filterColumns.forEach(column => memberGA.addQuery('user.' + column, currentUserGR.getValue(column)));
        }
        memberGA.addQuery('user.active', true);
        memberGA.groupBy('group');
        memberGA.query();
        return memberGA;
    },

    _getInsightsOnRoles(roles, currentUserGR, totalUsersCount, insightType, insightColumns) {
        if (roles.length === 0) {
            return [];
        }
        let hasRoleGA = this._getRoleUserCount(roles, insightColumns, currentUserGR);
        let insights = this._getIntermidateInsightsObj(roles, ROLE_ENTITY_TYPE, insightType, totalUsersCount);
        let insightsMap = new Map();
        insights.forEach(insight => insightsMap.set(insight.entityId, insight));

        while (hasRoleGA.next()) {
            const usersWithRolesCount = hasRoleGA.getAggregate('COUNT(DISTINCT', 'user');
            let insight = insightsMap.get(hasRoleGA.role.toString());
            insight.usersInEntityCount = parseInt(usersWithRolesCount);
        }
        return this._sortInsights(insights);
    },

    _getRoleUserCount(roles, filterColumns, currentUserGR) {
        let hasRoleGA = new GlideAggregate('sys_user_has_role');
        hasRoleGA.addAggregate('COUNT(DISTINCT', 'user');
        hasRoleGA.addQuery('role', 'IN', roles.map(role => role.id).toString());
        if (filterColumns) {
            filterColumns.forEach(column => hasRoleGA.addQuery('user.' + column, currentUserGR.getValue(column)));
        }
        hasRoleGA.addQuery('user.active', true);
        hasRoleGA.groupBy('role');
        hasRoleGA.query();
        return hasRoleGA;
    },

    _getIntermidateInsightsObj(entities, entityType, level, totalUsersCount) {
        return entities.map(entity => {
            return {
                entityType: entityType,
                level: level,
                entityId: entity.id,
                entityName: entity.name,
                usersInEntityCount: 0,
                totalUsersCount: parseInt(totalUsersCount)
            };
        });
    },

    _sortInsights(insights){
        insights.sort((a, b) => b.usersInEntityCount - a.usersInEntityCount);
        return insights;
    },

    type: 'AccessInsightsUtil'
};
