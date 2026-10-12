var PageOverlayUtils = Class.create();
PageOverlayUtils.prototype = {
    initialize: function() {},
    getLinkInfo: function(applicationId, pageId) {
        const app = new UXAApplicationUtils().getAllAppsForUser({
            applicationId
        })?.[0] || {};

        const params = {
            app_sys_id: applicationId,
            channel: app.ChannelNumber,
            page_names: [pageId]
        };
        let pageName = '';
        try {
            const names = new QueryServiceAPI().getPageNames(params);
            pageName = names.find(page => page.k === pageId)?.v || pageId;
        } catch (e) {
            pageName = '';
        }

        return {
            pageDisplayName: pageName,
            channel: app.ChannelType,
            applicationLabel: app.AppName,
            visualTaggingEnabled: gs.getProperty('glide.analytics.visual_tagging_enabled', true) == 'true',
            hasInstrumenterRole: gs.hasRole('analytics_instrumenter')
        };
    },

    type: 'PageOverlayUtils'
};
