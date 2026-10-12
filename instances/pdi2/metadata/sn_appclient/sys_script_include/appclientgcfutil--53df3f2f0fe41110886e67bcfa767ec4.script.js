var AppClientGCFUtil = Class.create();
AppClientGCFUtil.prototype = {
    initialize: function() {
        this.GCF_CATEGORY = "app_manager";
        this.eventsThatNeedsRelease = ["installation_time", "page_load_time", "first_load"];
        this.release = gs.getProperty("glide.buildname");
    },

    recordEvent: function(instrumentationPoint, instrumentationEvent, data) {
        try{
            var sampleMap = new GCFSampleMap();
            for(var key in data)
                sampleMap.put(key, data[key]);

            sampleMap = this.addRoleIfNeeded(instrumentationPoint, instrumentationEvent, sampleMap);

            if(this.eventsThatNeedsRelease.indexOf(instrumentationEvent) > -1)
                sampleMap.put("release", this.release);
            GCFCollector.recordUsageEvent(this.GCF_CATEGORY, instrumentationPoint, instrumentationEvent, sampleMap);
        } catch(e) {
            gs.debug("AppClientGCFUtil: Exception encountered while capturing analytics. Exception Info: " + JSON.stringify(e));
        }
    },

    addRoleIfNeeded: function(instrumentationPoint, instrumentationEvent, sampleMap) {
        if(instrumentationEvent != "app_install")
            return sampleMap;
        var role = "";
        if(gs.hasRole("maint"))
            role = "Maint";
        else if(gs.hasRole("admin"))
            role = "Admin";
        else if(gs.hasRole("sn_appclient.app_client_user"))
            role = "App Client User";
        sampleMap.put("installed_by", role);
        return sampleMap;
    },

    recordBatchInstallAnalytics: function(payload) {
        var productId = payload.product_id;
        var collectionData = {};
        collectionData.installation_type = "Batch Install";
        collectionData.is_search_applied = payload.isSearchApplied;
        collectionData.is_filter_applied = payload.isFilterApplied;
        this.recordEvent("install", "product_install", {"product_id": productId});
        this.captureBatchInstallAnalytics(collectionData, payload.packages);
    },

    captureBatchInstallAnalytics: function(collectionData, appsList) {
        for(var i=0;appsList && i<appsList.length;i++) {
            var app = appsList[i];
            if(app.requested_customization_version)
                app.is_customization_version = true;
            collectionData.app_id = app.source_app_id || app.id;
            collectionData.entity_type = app.is_plugin ? "Plugin" : "Store Application";
            collectionData.has_customization = app.is_customization_version == true;
            new AppClientGCFUtil().recordEvent("install", "app_install", collectionData);
        }
    },

    recordPageLoadAnalytics: function(payload) {
        payload.time = this.getTimeRange(payload.time);
        this.recordEvent("apps_landing", "page_load_time", payload);
    },

    getTimeRange: function(time) {
        if(time < 1)
            return "0-1 secs";
        else if(time<3)
            return "1-3 secs";
        else if(time<5)
            return "3-5 secs";
        else if(time<10)
            return "5-10 secs";
        else
            return "10+ secs";
    },

    type: 'AppClientGCFUtil'
};
