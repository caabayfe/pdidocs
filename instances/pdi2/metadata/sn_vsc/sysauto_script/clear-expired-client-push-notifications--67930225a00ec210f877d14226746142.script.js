var gr = new GlideRecord('sn_vsc_client_push_notifications');
gr.query();
while (gr.next()) {
    if (new sn_vsc.CustomerPushActionUtils().isExpiredNotification(gr)) {
        new sn_vsc.CustomerPushActionUtils().deleteBannerRecord(gr.banner.sys_id);
        gr.deleteRecord();
    }
}
