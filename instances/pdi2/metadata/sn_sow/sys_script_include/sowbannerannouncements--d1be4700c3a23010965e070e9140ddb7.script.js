var SOWBannerAnnouncements = Class.create();
SOWBannerAnnouncements.getAnnouncementIds = function() {
    if(!gs.hasRole('sn_sow.sow_user')) return [];
    var configId = gs.getProperty('sn_sow.banner_announcements_config_id');
    var sysIds = [];
    if (false == gs.nil(configId)) {
        // Skip role and group checks as these will be done by ACL on banner announcements
		// Sourced from com.glide.ux_banner_announcement.repositories.AnnouncementRepository.getAnnouncements()
        var gr = new GlideRecord('sys_ux_m2m_banner_announcement');
        gr.addQuery('announcement_config', configId);
        var start = gr.addNullQuery('announcement.start');
        start.addOrCondition('announcement.start', "<=", new GlideDateTime());
        var end = gr.addNullQuery('announcement.end');
        end.addOrCondition('announcement.end', ">=", new GlideDateTime());
        gr.query();
        while (gr.next()) {
            sysIds.push(gr.getValue('announcement'));
        }
    }
    return sysIds;
};
SOWBannerAnnouncements.prototype = {
    type: 'SOWBannerAnnouncements',
    initialize: function() {}
};
