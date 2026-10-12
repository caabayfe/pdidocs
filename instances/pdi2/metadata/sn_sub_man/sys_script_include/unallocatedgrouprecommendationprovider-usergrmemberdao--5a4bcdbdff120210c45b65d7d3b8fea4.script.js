var UnallocatedGroupRecommendationProvider_UserGrmemberDao = Class.create();
UnallocatedGroupRecommendationProvider_UserGrmemberDao.prototype = {
    initialize: function() {},

    getGroupUserCountsMap: function(groupIds) {
        if (!groupIds)
            return new Map();

        const ga = new GlideAggregate('sys_user_grmember');
        ga.addQuery('group', 'IN', groupIds);
        ga.groupBy('group');
        ga.addAggregate('COUNT');
        ga.query();

        const counts = new Map();
        while (ga.next()) {
            const groupId = ga.getValue('group');
            const userCount = ga.getAggregate('COUNT');

            if (groupId && groupId.length > 0)
                counts.set(groupId, userCount);
        }
        return counts;
    },

    type: 'UnallocatedGroupRecommendationProvider_UserGrmemberDao'
};
