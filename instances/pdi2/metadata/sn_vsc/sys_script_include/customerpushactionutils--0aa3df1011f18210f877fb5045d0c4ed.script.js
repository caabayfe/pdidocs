var CustomerPushActionUtils = Class.create();
CustomerPushActionUtils.prototype = {
    initialize: function() {},
    createUXBanner: function(pushRecord) {
        var grBanner = new GlideRecord("sys_ux_banner_announcement");
        grBanner.initialize();
        grBanner.heading = "Security banner announcement";
        grBanner.summary = pushRecord.description;
        var startDate = new GlideDateTime();
        startDate.addDaysUTC(-3);
        grBanner.start = startDate;
        grBanner.end = new GlideDateTime(pushRecord.expiration_date);
        grBanner.color = "critical";
        grBanner.content_position = "start";
        grBanner.icon.setDisplayValue("circle-exclamation-outline");
        this.setBannerLink(pushRecord, grBanner);
        grBanner.show_for = "specified_users";
        grBanner.roles = "2831a114c611228501d4ea6c309d626d";
        var bannerRecord = grBanner.insert();
        var grAssociatedRecord = new GlideRecord("sys_ux_m2m_banner_announcement");
        grAssociatedRecord.initialize();
        grAssociatedRecord.announcement_config = "36aefd8153223010f296ddeeff7b12e9";
        grAssociatedRecord.announcement = bannerRecord;
        grAssociatedRecord.insert();
        return bannerRecord;
    },

    getLastUpdatedFromClientSchedule: function() {
        var grClientSchedule = new GlideRecord("cds_client_schedule");
        if (grClientSchedule.get("48c5005f93a542103c67134732891864"))
            return grClientSchedule.last_updated_on;
    },

    activateCPARecords: function() {
        var gr = new GlideRecord('sn_vsc_client_push_notifications');
        gr.addEncodedQuery('active=false^purpose=production'); // Query for inactive updates which are non-test records
        gr.query();
        while (gr.next()) {
            if (this.evaluateAllConditions(gr) && !this.isExpiredNotification(gr)) {
                gr.active = true;
                if (gr.banner == "") //banner doesn't exist
                    gr.banner = this.createUXBanner(gr); //Create new banner announcement 
                gr.update();
                gs.info("Activated push notification record {0} and created banner announcement {1}", gr.sys_id, gr.banner);
            }
        }
    },

    /*
     * Deactivate records which are expired or no longer satisfy all conditions
     */
    deactivateCPARecords: function() {
        var gr = new GlideRecord('sn_vsc_client_push_notifications');
        gr.addEncodedQuery('active=true^purpose=production'); // Query for inactive updates which are non-test records
        gr.query();
        while (gr.next()) {
            if (!this.evaluateAllConditions(gr) || this.isExpiredNotification(gr)) {
                gr.active = false;
                if (gr.banner != "") {
                    this.deleteBannerRecord(gr.banner.sys_id);
                }
                gr.update();
                gs.info("Deactivated push notification record {0} and related banner record", gr.sys_id);
            }
        }
    },

    deleteBannerRecord: function(bannerRecord) {
        var grMappingRec = new GlideRecord("sys_ux_m2m_banner_announcement");
        grMappingRec.addQuery("announcement", bannerRecord);
        grMappingRec.query();
        if (grMappingRec.next())
            grMappingRec.deleteRecord();

        var grBanner = new GlideRecord("sys_ux_banner_announcement");
        if (grBanner.get(bannerRecord))
            grBanner.deleteRecord();
    },

    handleCPARecordUpdates: function() {
        var grRec = new GlideRecord('sn_vsc_client_push_notifications');
        grRec.addEncodedQuery('active=true^purpose=production'); // Query for inactive updates which are non-test records
        grRec.query();
        while (grRec.next()) {
            this.updateBannerRecord(grRec);
        }
    },

    isExpiredNotification: function(pushRecord) {
        var expirationdateField = new GlideDateTime(pushRecord.expiration_date);
        var currentTime = new GlideDateTime();
        var todaysDate = new GlideDateTime(currentTime.getLocalDate());
        var dur = new GlideDuration();
        dur = GlideDateTime.subtract(todaysDate, expirationdateField);
        var days = dur.getDayPart();
        return days < 0;
    },

    updateBannerRecord: function(pushRecord) {
        var grBanner = new GlideRecord("sys_ux_banner_announcement");
        if (grBanner.get(pushRecord.banner.sys_id)) {
            grBanner.summary = pushRecord.description;
            if (grBanner.getValue('start') < pushRecord.expiration_date)
                grBanner.end = new GlideDateTime(pushRecord.expiration_date);
            this.setBannerLink(pushRecord, grBanner);
            grBanner.update();
            gs.info("Updated banner announcement {0} with link {1}", pushRecord.banner.sys_id, grBanner.link_url);
        }
    },

    evaluateAllConditions: function(pushRecord) {
        return (this.evaluatePluginConditions(pushRecord) && this.evaluatePropertyConditions(pushRecord) && this.evaluateTableConditions(pushRecord));
    },

    evaluatePluginConditions: function(pushRecord) {
        if (global.JSUtil.notNil(pushRecord.conditional_plugins)) {
            var pluginArr = pushRecord.conditional_plugins.split(',');
            var pMgr = new GlidePluginManager();
            for (var i = 0; i < pluginArr.length; i++) {
                if (!pMgr.isActive(pluginArr[i]))
                    return false;
            }
        }
        return true;
    },

    evaluatePropertyConditions: function(pushRecord) {
        if (pushRecord.conditional_properties == "")
            return true;
        for (var property in pushRecord.conditional_properties) {
            if (pushRecord.conditional_properties[property] != gs.getProperty(property))
                return false;
        }
        return true;
    },

    evaluateTableConditions: function(pushRecord) {
        if (pushRecord.conditions == "")
            return true;
        var gr = new GlideRecord(pushRecord.table);
        gr.addEncodedQuery(pushRecord.conditions);
        gr.query();
        return gr.hasNext();
    },

    setBannerLink: function(pushRecord, grBanner) {
        var url = pushRecord.link;
        //disable banner link on pushRecord missing link
        if (!url) {
            grBanner.add_link = false;
            return;
        }

        var bannerLinkUrl;
        if (!pushRecord.link_type || url.startsWith("http:") || url.startsWith("https:"))
            bannerLinkUrl = url;
        else if (pushRecord.link_type == 'support_portal_link')
            bannerLinkUrl = gs.getProperty("glide.management.host", "https://support.servicenow.com/") + url;

        grBanner.add_link = true;
        grBanner.link_click_behavior = "new";
        grBanner.link_label = "Address risk now";
        grBanner.link_url = bannerLinkUrl;
    },

    scheduleNotificationsDownloadJob: function() {
        //get job record
        var record = new GlideRecord("sysauto_script");
        if (!record.get('1e318661a00ec210f877d142267461f4'))
            return;

        //get schedule start time
        var runPeriodProp = gs.getProperty('sn_vsc.cpa_notification_download_schedule.run_period_duration', '3 12:00:00');
        var runPeriod = new GlideDuration(runPeriodProp);
        var cdsPeakHoursProp = gs.getProperty("cds.peak_hours_utc", "7,23");
        var peakHours = cdsPeakHoursProp.split(",").map(Number);
        var cdsPeakHoursDriftProp = gs.getProperty("cds.peak_hours.max_drift_minutes", "30");
        var drift = parseInt(cdsPeakHoursDriftProp);
        var startTime = this.getRandomStartTimeForDownloadSchedule(runPeriod, peakHours, drift);
		gs.info("calculated start time "+startTime);

        //update job's periodic schedule
        record.setValue("run_type", "periodically");
        record.setValue("run_period", runPeriod);
        record.setValue("run_start", startTime);
        if(record.isValidField("entered_run_start"))
            record.setValue("entered_run_start", startTime);
        record.update();
        gs.info("Scheduled Job 1e318661a00ec210f877d142267461f4 with calculated start time {0}", String(startTime));

        //init last_updated_on of cds_client_schedule to 6 months back
        var cdsSchedule = new GlideRecord("cds_client_schedule");
        if (!cdsSchedule.get("48c5005f93a542103c67134732891864") ||
            cdsSchedule.last_updated_on)
            return;
        var startDate = new GlideDateTime();
        startDate.addDaysUTC(-180);
        cdsSchedule.last_updated_on = startDate;
        cdsSchedule.update();
        gs.info("Updated last_updated_on in cds_client_schedule 48c5005f93a542103c67134732891864 to be {0}", startDate);
    },

    getRandomStartTimeForDownloadSchedule: function(runPeriod, peakHours, drift) {
        //get a random time for the given period
        var localDate = new GlideDateTime();
        localDate.add(this.getRandomInt(0, runPeriod.getNumericValue()));

        //adjust schedule time to avoid peakhours
        if (!peakHours)
            return localDate;

        //move the schedule by 1 + 2*drift mins when schedule is inside peak hours range
        var minutesOfDayUTC = this.getMinutesOfDayUTC(localDate);
        for (var i in peakHours) {
            var startMin = (peakHours[i] * 60 - drift);
            var endMin = ((peakHours[i] + 1) * 60 + drift) % 1440;
            if (this.isInMinutesRange(minutesOfDayUTC, startMin, endMin)) {
                localDate.add((60 + 2 * drift) * 60000);
                minutesOfDayUTC = this.getMinutesOfDayUTC(localDate);
            }
        }

        return localDate;
    },

    getRandomInt: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getMinutesOfDayUTC: function(gdt) {
        var gt = new GlideTime(gdt.getNumericValue());
        return gt.getHourOfDayUTC() * 60 + gt.getMinutesUTC();
    },

    isInMinutesRange: function(x, start, end) {
        if (start <= end)
            return x >= start && x <= end;
        else
            return x >= start || x <= end;
    },

    type: 'CustomerPushActionUtils'
};
