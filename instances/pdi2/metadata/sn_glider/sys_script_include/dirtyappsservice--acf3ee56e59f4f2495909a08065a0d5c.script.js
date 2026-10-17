var DirtyAppsService = Class.create();
DirtyAppsService.prototype = {
    initialize: function() {
    },

    getDirtyApps: function(filter, sortBy, sortOrder) {
        var usGR = new GlideRecord('sys_update_set');
        usGR.addQuery('state', 'in progress');
        usGR.query();

        var updateSetIds = [];
        var updateSetsByScope = {};
        var updateSetToScope = {};
        while (usGR.next()) {
            var usId = usGR.getUniqueValue();
            var scopeId = usGR.getValue('application') + '';
            updateSetIds.push(usId);
            updateSetToScope[usId] = scopeId;
            if (!updateSetsByScope[scopeId]) updateSetsByScope[scopeId] = [];
            updateSetsByScope[scopeId].push(usId);
        }

        if (updateSetIds.length === 0) {
            return [];
        }

        var updateSetIdList = updateSetIds.join(',');

        var countByUpdateSet = {};
        var countGa = new GlideAggregate('sys_update_xml');
        countGa.addQuery('update_set', 'IN', updateSetIdList);
        countGa.addAggregate('COUNT');
        countGa.groupBy('update_set');
        countGa.query();
        while (countGa.next()) {
            countByUpdateSet[countGa.getValue('update_set')] = parseInt(countGa.getAggregate('COUNT'), 10) || 0;
        }

        var scopeChangeCounts = {};
        for (var usKey in countByUpdateSet) {
            var scope = updateSetToScope[usKey];
            if (!scope) continue;
            if (!scopeChangeCounts[scope]) scopeChangeCounts[scope] = 0;
            scopeChangeCounts[scope] += countByUpdateSet[usKey];
        }

        var appChangeCounts = {};
        var appCountGa = new GlideAggregate('sys_update_xml');
        appCountGa.addQuery('update_set', 'IN', updateSetIdList);
        appCountGa.addAggregate('COUNT');
        appCountGa.groupBy('application');
        appCountGa.query();
        while (appCountGa.next()) {
            appChangeCounts[appCountGa.getValue('application')] = parseInt(appCountGa.getAggregate('COUNT'), 10) || 0;
        }

        var appSysIds = [];
        var seenIds = {};
        if (filter === 'all') {
            for (var allScope in updateSetsByScope) {
                if (!seenIds[allScope]) {
                    seenIds[allScope] = true;
                    appSysIds.push(allScope);
                }
            }
            var allAppGa = new GlideAggregate('sys_update_xml');
            allAppGa.addQuery('update_set', 'IN', updateSetIdList);
            allAppGa.groupBy('application');
            allAppGa.query();
            while (allAppGa.next()) {
                var xmlAppId = allAppGa.getValue('application');
                if (xmlAppId && !seenIds[xmlAppId]) {
                    seenIds[xmlAppId] = true;
                    appSysIds.push(xmlAppId);
                }
            }
        } else {
            var helper = new global.DirtyAppsHelper();
            var myUpdateSetIds = helper.getMyDirtyUpdateSetIds(updateSetIdList, gs.getUserName());
            for (var i = 0; i < myUpdateSetIds.length; i++) {
                var usScope = updateSetToScope[myUpdateSetIds[i]];
                if (usScope && !seenIds[usScope]) {
                    seenIds[usScope] = true;
                    appSysIds.push(usScope);
                }
            }
            var myAppIds = helper.getMyDirtyAppIds(updateSetIdList, gs.getUserName());
            for (var j = 0; j < myAppIds.length; j++) {
                if (!seenIds[myAppIds[j]]) {
                    seenIds[myAppIds[j]] = true;
                    appSysIds.push(myAppIds[j]);
                }
            }
        }

        if (appSysIds.length === 0) {
            return [];
        }

        var apps = [];
        var appGR = new GlideRecord('sys_scope');
        appGR.addQuery('sys_id', 'IN', appSysIds.join(','));
        if (sortOrder === 'asc') {
            appGR.orderBy(sortBy);
        } else {
            appGR.orderByDesc(sortBy);
        }
        appGR.query();

        while (appGR.next()) {
            if (!appGR.canRead()) continue;
            var appSysId = appGR.getUniqueValue();
            apps.push({
                sysId: appSysId,
                name: appGR.getValue('name'),
                scope: appGR.getValue('scope'),
                table: appGR.getValue('sys_class_name'),
                sys_class_name: appGR.getValue('sys_class_name'),
                sys_updated_on: appGR.getValue('sys_updated_on'),
                changeCount: appGR.getValue('scope') === 'global' ? (scopeChangeCounts['global'] || 0) : (scopeChangeCounts[appSysId] || 0)
            });
        }

        return apps;
    },

    type: 'DirtyAppsService'
};
