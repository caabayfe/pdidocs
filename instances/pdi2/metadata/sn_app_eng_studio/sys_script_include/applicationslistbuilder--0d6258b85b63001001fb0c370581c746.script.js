var ApplicationsListBuilder = Class.create();
ApplicationsListBuilder.prototype = {
    initialize: function() {},

    _getSortedLastOpenedApps: function(lastOpenedAppsLookup, sortOrder, searchTerm) {
        var lastOpenedApps = [];
        for (var key in lastOpenedAppsLookup) {
            lastOpenedApps.push({
                "sys_id": key,
                "last_opened_in_aes": lastOpenedAppsLookup[key]
            });
        }

        lastOpenedApps.sort(function(a, b) {
            if (a.last_opened_in_aes === b.last_opened_in_aes) {
                return 0;
            }

            if (!a.last_opened_in_aes)
                return 1;

            if (!b.last_opened_in_aes)
                return -1;

            if (sortOrder === CreatorStudioConstants.sorting.ASC_ORDER) {
                return a.last_opened_in_aes < b.last_opened_in_aes ? -1 : 1;
            } else {
                return b.last_opened_in_aes < a.last_opened_in_aes ? -1 : 1;
            }
        });

        return lastOpenedApps.map(function(x) {
            return x.sys_id;
        });
    },

    _getSysAppTemplates: function() {
        var sysAppTemplateSysIds = [];
        var gr_appTemplates = new GlideRecord('sys_app_template');
        gr_appTemplates.addQuery('create_app', 'true');
        gr_appTemplates.query();

        while (gr_appTemplates.next()) {
            var appTemplateScope = gr_appTemplates.getValue('sys_scope');
            sysAppTemplateSysIds.push(appTemplateScope);
        }

        return sysAppTemplateSysIds;
    },

    _getSourceApps: function() {
        var sourceAppSysIds = [];
        var gr = new GlideRecord('sys_app_info');
        gr.query();

        while (gr.next()) {
            var properties = gr.getValue('properties');
            var propertiesObj = {};

            try {
                propertiesObj = JSON.parse(properties);

                if (propertiesObj && propertiesObj.hasOwnProperty("origin") && propertiesObj["origin"] === "create_from_scratch") {
                    sourceAppSysIds.push(gr.getValue('sys_scope'));
                }
            } catch (ex) {
                gs.error('Unable to parse properties of sys_app_info record with sys_id: ' + gr.get('sys_id') + ' properties value: ' + properties);
            }

        }

        return sourceAppSysIds;
    },

    _sortFieldValid: function(sort_field) {
        // is the sort_field value in the array of approved fields to sort upon?
        if (CreatorStudioConstants.sorting.APPS_SORT_APPROVED_FIELDS.indexOf(sort_field) > -1) {
            // yes
            return true;
        }

        // no
        return false;
    },

    getUserApps: function(args) {
        // valid arg params
        args = args || {};
        var sortField = args.sortField;
        var sortOrder = args.sortOrder;
        var allowTemplateApps = args.allowTemplateApps;
        var limit = args.limit;
        var offset = args.offset;
        var searchTerm = args.searchTerm;
        var lastOpenedAppsLookup = args.lastOpenedAppsLookup || new ApplicationService().getUserAppsLastOpened({
            searchTerm: searchTerm
        });

        var result = {
            applications: [],
            hasMore: false
        };
        var endIndex;
        var serviceLimit;
        var serviceOffset;
        var excludedAppSysIds = [];
        var applicationServiceResult;
		var userAppsLastOpened;
        var userLastOpenedCount;
        var userAppsLastOpenedWindow;

        if (!this._sortFieldValid(sortField)) {
            sortField = CreatorStudioConstants.sorting.APPS_SORT_DEFAULT_FIELD;
        }

        if (allowTemplateApps == 'false') {
            excludedAppSysIds = this._getSysAppTemplates().concat(this._getSourceApps());
        }

        if (sortField !== CreatorStudioConstants.sorting.APPS_SORT_DEFAULT_FIELD) {
            applicationServiceResult = new ApplicationService().getUserApplications({
                sortField: sortField,
                sortOrder: sortOrder,
                offset: offset,
                limit: limit,
                searchTerm: searchTerm,
                excludedAppSysIds: excludedAppSysIds
            });

            result = {
                applications: applicationServiceResult.applications,
                hasMore: applicationServiceResult.hasMore,
            };

            return result;
        }

        // get the user's last opened apps and add more from the service if needed
        userAppsLastOpened = this._getSortedLastOpenedApps(lastOpenedAppsLookup, sortOrder, searchTerm);

        userAppsLastOpened = userAppsLastOpened.filter(function(appSysId) {
            return excludedAppSysIds.indexOf(appSysId) === -1;
        });

        if (limit !== null && offset !== null) {
            endIndex = offset + limit;
            userLastOpenedCount = userAppsLastOpened.length;
            userAppsLastOpenedWindow = userAppsLastOpened.slice(offset, endIndex);

            if (userLastOpenedCount > endIndex) {
                // we have more than enough last opened apps to satisfy the request
                result = {
                    applications: userAppsLastOpenedWindow,
                    hasMore: true,
                };

                return result;

            } else if (userLastOpenedCount === endIndex) {
                // retrieve one app from the service to find out if we have more
                serviceLimit = 1;
                serviceOffset = 0;
                applicationServiceResult = new ApplicationService().getUserApplications({
                    sortField: 'sys_updated_on',
                    sortOrder: sortOrder,
                    offset: serviceOffset,
                    limit: serviceLimit,
                    excludedAppSysIds: excludedAppSysIds.concat(userAppsLastOpened),
                    searchTerm: searchTerm,
                });

                result = {
                    applications: userAppsLastOpenedWindow,
                    hasMore: applicationServiceResult.applications.length === 1,
                };

                return result;
            }

            // retrieve additional apps from service, modify limit and offset to account for last opened app count
            serviceLimit = limit - userAppsLastOpenedWindow.length;
            serviceOffset = userAppsLastOpenedWindow.length ? 0 : offset - userLastOpenedCount;
            applicationServiceResult = new ApplicationService().getUserApplications({
                sortField: 'sys_updated_on',
                sortOrder: sortOrder,
                offset: serviceOffset,
                limit: serviceLimit,
                excludedAppSysIds: excludedAppSysIds.concat(userAppsLastOpened),
                searchTerm: searchTerm,
            });

            userAppsLastOpened = userAppsLastOpenedWindow;

        } else {
            // retrieve all apps from service
            applicationServiceResult = new ApplicationService().getUserApplications({
                sortField: 'sys_updated_on',
                sortOrder: sortOrder,
                offset: offset,
                limit: limit,
                excludedAppSysIds: excludedAppSysIds.concat(userAppsLastOpened),
                searchTerm: searchTerm,
            });
        }

        result = {
            applications: userAppsLastOpened.concat(applicationServiceResult.applications),
            hasMore: applicationServiceResult.hasMore,
        };

        return result;

    },

    type: 'ApplicationsListBuilder'
};
