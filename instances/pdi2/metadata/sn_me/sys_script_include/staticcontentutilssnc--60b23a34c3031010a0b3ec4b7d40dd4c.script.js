var StaticContentUtilsSNC = Class.create();
StaticContentUtilsSNC.prototype = {
    initialize: function() {},
    noRunningCampaign: function() {
        var isCampaignPluginActive = GlidePluginManager.isActive('com.sn_content_automation');
        var isContentDeliveryPluginActive = GlidePluginManager.isActive('com.sn_content_delivery');

        if (isCampaignPluginActive) {
            var isCampaignRunning = new sn_ca.ca_CampaignMobileUtils().getMobileContentSysIds();
            if (isCampaignRunning.length > 0)
                return false;
        }

        if (isContentDeliveryPluginActive) {
            var isContentScheduled = new sn_cd.cd_MobileUtils().getContentSysIDs();
            if (isContentScheduled.length > 0)
                return false;
        }
        return true;
    },
	
	getContentWithImage: function() {
		var sysIds = [];
		var sysId;
		var gr = new GlideRecordSecure("sn_me_static_media_section");
		gr.query();
		while(gr.next()) {
			sysId = gr.getValue("sys_id");
			if(this._hasAttachment(sysId))
				sysIds.push(sysId);
		}
		return sysIds;
	},
	
	_hasAttachment: function(sysId) {
		var gr = new GlideRecordSecure("sys_attachment");
		gr.addQuery("table_name", "ZZ_YYsn_me_static_media_section");
		gr.addQuery("table_sys_id", sysId);
		gr.query();
		return gr.hasNext();
	},

    type: 'StaticContentUtilsSNC'
};
