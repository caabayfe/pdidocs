var UXAApplicationUtils = Class.create();
const CHANNEL_ROLE_MAPPING = {
    'chat': 'chat_analytics_viewer',
    'mobile': 'mobile_analytics_viewer',
    'web': 'portal_analytics_viewer',
    'CoreUI': 'core_ui_analytics_viewer',
    'NextExperience': 'now_experience_analytics_viewer'
};
const SEARCH_ANALYTICS = 'search-analytics';
const VA_ANALYTICS = 'virtual-agent-analytics';

UXAApplicationUtils.prototype = {
    initialize: function() {
        this.logger = QueryServiceApiLogger.getLogger('UXAApplicationUtils');
    },

    canAccessChannel: function(channel) {
        return gs.hasRole(CHANNEL_ROLE_MAPPING[channel]);
    },

    getChannelsForUser: function() {
        const channelsToQuery = [];
        Object.entries(CHANNEL_ROLE_MAPPING).forEach(([channel, role]) => {
            if (gs.hasRole(role))
                channelsToQuery.push(channel);
        });
        return channelsToQuery;
    },

    getChannels: function(params = {}) {
        const channels = this.getChannelsForUser();
        const gr = new GlideRecord(UXAConstants.TABLE.ANALYTICS_CHANNEL);
        let query = `${UXAConstants.NAME}!=chat`;
        if (channels.length)
            query = `${query}^nameIN${channels.join()}`;

        gr.addEncodedQuery(query);

        //check if params has searchText
        if (params?.searchText)
            gr.addQuery('display_name', 'CONTAINS', params.searchText);

        //Check if params contains sort order
        if (params?.sortOrder) {
            if (params?.sortOrder === 'DESC')
                gr.orderByDesc('name');
            else
                gr.orderBy('name');
        }


        gr.query();
        const allowedChannels = {};
        while (gr.next()) {
            let channelName = gr.getValue(UXAConstants.NAME);
            channelName = channelName.charAt(0).toUpperCase() + channelName.slice(1);
            allowedChannels[channelName] = {
                id: gr.getValue('id'),
                value: gr.getValue('display_name'),
                key: gr.getValue('name')
            };
        }
        return allowedChannels;
    },

    getAllAppsForUser: function(params = {}) {
        const channelsToQuery = this.getChannelsForUser();

        const appsGr = new GlideRecord('sys_analytics_app');
        appsGr.addQuery('analytics_channel.name', channelsToQuery);
        appsGr.addActiveQuery();
        //check if params has searchText
        if (params?.searchText)
            appsGr.addQuery('application_name', 'CONTAINS', params.searchText);

        //Check if params contains sort order
        if (params?.sortOrder) {
            if (params?.sortOrder === 'DESC')
                appsGr.orderByDesc('application_name');
            else
                appsGr.orderBy('application_name');
        }

        if (params?.applicationId) {
            appsGr.addQuery('app_sys_id', params.applicationId);
            // Assuming there is only one analytics app with a given id
            appsGr.setLimit(1);
        }

        appsGr.query();
        const result = [];
        while (appsGr.next()) {
            const resultObj = {
                "ChannelNumber": appsGr.analytics_channel.id.toString(),
                "AppSysId": appsGr.getValue('app_sys_id'),
                "Active": global.JSUtil.getBooleanValue(appsGr, 'active'),
                "AnalyticsEnabledForUnauthenticatedUser": global.JSUtil.getBooleanValue(appsGr, 'enable_unauthenticated_user_tracking'),
                "AppName": appsGr.getValue('application_name'),
                "ChannelType": appsGr.analytics_channel.name.toString(),
                "TableName": appsGr.getValue('table_name'),
                "ChannelName": appsGr.analytics_channel.display_name.toString()
            };
            result.push(resultObj);
        }

        return result;
    },
    _buildHierarchy: function(records, parent = null) {
        const result = [];
        for (const record of records) {
            if (record.parent === parent) {
                const children = this._buildHierarchy(records, record.sysId);
                if (children.length > 0) {
                    record.children = children;
                }
                // check if its actionable or it has childen, then only add, do not add items which are not actionable and parents without children into menu
                if (record.isActionable || (record.children && record.children.length > 0))
                    result.push(record);
            }
        }
        return result;
    },
    _aclError: function() {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(403);
        error.setMessage('Security violation');
        error.setDetail('User does not have access to view this application');
        return error;
    },
    getMenuForApp: function(appId) {
        let menuReference;
        if (!appId) {
            return [];
        }
        if (appId == 'all') {
            const appMappingGr = new GlideRecord('sn_uxa_app_menu_mapping');
            appMappingGr.addNullQuery('app');
            appMappingGr.query();
            if (!appMappingGr.hasNext()) return [];
            appMappingGr.next();
            menuReference = appMappingGr.getValue('menu');
        } else {
            const bucketGr = new GlideRecord('sys_analytics_app');

            bucketGr.addQuery('app_sys_id', appId);
            bucketGr.addActiveQuery();
            bucketGr.query();
            if (!bucketGr.hasNext()) return []; //no matching app with bucket document id -> just return empty.
            bucketGr.next();
            const appUtils = new UXAApplicationUtils();
            if (!appUtils.canAccessChannel(bucketGr.analytics_channel.name.toString())) {
                return this._aclError();
            }
            const app = {
                channel: bucketGr.getValue('analytics_channel'),
                name: bucketGr.getValue('application_name'),
                sysId: bucketGr.getUniqueValue()
            };

            // check app menu mapping, if its present, then get it from that or else get it from channel mapping table

            const appMappingGr = new GlideRecord('sn_uxa_app_menu_mapping');
            appMappingGr.addQuery('app', app.sysId);
            appMappingGr.addActiveQuery();
            appMappingGr.query();
            if (appMappingGr.hasNext()) {
                appMappingGr.next();
                menuReference = appMappingGr.getValue('menu');
            } else {
                // check channel level menu mapping
                const channelMappingGR = new GlideRecord('sn_uxa_channel_menu_mapping');
                channelMappingGR.addQuery('channel', app.channel);
                channelMappingGR.addActiveQuery();
                channelMappingGR.query();
                if (channelMappingGR.hasNext()) {
                    channelMappingGR.next();
                    menuReference = channelMappingGR.getValue('menu');
                }
            }
        }



        if (!menuReference) return [];
        // get all menu items from the menu item table

        var menuItemGr = new GlideRecord('sn_uxa_menu_item');
        menuItemGr.addQuery('menu', menuReference);
        menuItemGr.orderBy('order');
        menuItemGr.query();
        let menuRecords = [];
        if (menuItemGr.hasNext()) {
            while (menuItemGr.next()) {
                if (menuItemGr.getValue('name') == SEARCH_ANALYTICS) {
                    //check if admin tools is enabled then only push
                    if (GlidePluginManager.isActive('sn_ais_admin_tools')) {
                        menuRecords.push({
                            id: menuItemGr.getValue('name'),
                            sysId: menuItemGr.getUniqueValue(),
                            label: menuItemGr.getDisplayValue('label'),
                            route: menuItemGr.getValue('route'),
                            icon: menuItemGr.getValue('icon'),
                            isExternal: menuItemGr.getValue('is_external'),
                            externalUrl: menuItemGr.getValue('external_url'),
                            actions: menuItemGr.getValue('is_external') == 1 ? [{
                                icon: "open-link-right-fill",
                                label: "Open link"
                            }] : [],
                            isActionable: menuItemGr.getValue('actionable') == 1 ? true : false,
                            defaultSelected: menuItemGr.getValue('default_selected') == 1 ? true : false,
                            parent: menuItemGr.getValue('parent_menu_item') || null
                        });
                    }
                } else if (menuItemGr.getValue('name') == VA_ANALYTICS) {
                    //check if admin tools is enabled then only push
                    if (GlidePluginManager.isActive('com.glide.cs.chatbot')) {
                        menuRecords.push({
                            id: menuItemGr.getValue('name'),
                            sysId: menuItemGr.getUniqueValue(),
                            label: menuItemGr.getDisplayValue('label'),
                            route: menuItemGr.getValue('route'),
                            icon: menuItemGr.getValue('icon'),
                            isExternal: menuItemGr.getValue('is_external'),
                            externalUrl: menuItemGr.getValue('external_url'),
                            actions: menuItemGr.getValue('is_external') == 1 ? [{
                                icon: "open-link-right-fill",
                                label: "Open link"
                            }] : [],
                            isActionable: menuItemGr.getValue('actionable') == 1 ? true : false,
                            defaultSelected: menuItemGr.getValue('default_selected') == 1 ? true : false,
                            parent: menuItemGr.getValue('parent_menu_item') || null
                        });
                    }
                } else {
                    menuRecords.push({
                        id: menuItemGr.getValue('name'),
                        sysId: menuItemGr.getUniqueValue(),
                        label: menuItemGr.getDisplayValue('label'),
                        route: menuItemGr.getValue('route'),
                        icon: menuItemGr.getValue('icon'),
                        isExternal: menuItemGr.getValue('is_external'),
                        actions: menuItemGr.getValue('is_external') == 1 ? [{
                            icon: "open-link-right-fill",
                            label: "Open link"
                        }] : [],
                        externalUrl: menuItemGr.getValue('external_url'),
                        isActionable: menuItemGr.getValue('actionable') == 1 ? true : false,
                        defaultSelected: menuItemGr.getValue('default_selected') == 1 ? true : false,
                        parent: menuItemGr.getValue('parent_menu_item') || null
                    });
                }

            }
        }
        const heirarchicalMenu = this._buildHierarchy(menuRecords);
        this.logger.debug(JSON.stringify(heirarchicalMenu));
        return heirarchicalMenu;
    },

    type: 'UXAApplicationUtils'
};
