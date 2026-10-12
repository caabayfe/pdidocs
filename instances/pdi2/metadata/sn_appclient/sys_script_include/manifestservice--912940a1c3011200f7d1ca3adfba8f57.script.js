var ManifestService = Class.create();
ManifestService.prototype = {
    initialize: function() {
    },

	getAllMissingManifests: function() {
		gs.info("Requesting app manifests for all sys_app_versions for which no manifest is present.");

		//loop through the sys_app_version table, ask the store for any missing manifests
		var appVersions = new GlideRecord("sys_app_version");
		appVersions.addNullQuery("manifest");
		appVersions.query();

		while (appVersions.next()) {
			var version = appVersions.getValue("version");
			var app_id = appVersions.getValue("source_app_id");

			this.getManifestForAppVersion(app_id, version);
		}

		// loop through the sys_app_customization table, ask the store for any missing manifests
		var customizationVersions = new GlideRecord("sys_app_customization_version")
		customizationVersions.addNullQuery("manifest");
		customizationVersions.query();

		while (customizationVersions.next()) {
		    var version = customizationVersions.getValue("version");
		    var app_id = customizationVersions.getValue("app_customization");

		    this.getManifestForAppVersion(app_id, version, true);
		}
	},

    getManifestForAppVersionSysId: function(/* string, string */ source_app_id, version){
        gs.info("Getting manifest for source_app_id {0}", source_app_id);
        var manifest;
        var versionRecord = new GlideRecord("sys_app_version");
        versionRecord.addQuery("source_app_id", source_app_id);
        versionRecord.addQuery("version", version);
        versionRecord.query();
        if(versionRecord.next()) {
            manifest = versionRecord.getValue("manifest");
            try {
                if(manifest && manifest.trim().length != 0)
                    manifest = new global.JSON().decode(manifest);
                else
                    manifest = this.getManifestForAppVersion(source_app_id, version);
            } catch (e) {
                gs.error("Unable to convert manifest {0} to JSON object. Perhaps it's not valid? Error is {1}", manifest, e);
            }
        }
        return manifest;
    },

	getManifestForAppVersion: function(/* string */ app_id,/* string */ version,/* boolean */ isAppCustomization,/* boolean */ ignoreTransactionLimits) {
		gs.info("Getting manifest for app {0}, version {1}", app_id, version);
		var manifest;
		var versionRecord;

		if (isAppCustomization) {
		    versionRecord = new GlideRecord("sys_app_customization_version");
		    versionRecord.addQuery("app_customization", app_id);
		} else {
		    versionRecord = new GlideRecord("sys_app_version");
		    versionRecord.addQuery("source_app_id", app_id);
		}

		versionRecord.addQuery("version", version);
		versionRecord.query();

		if(versionRecord.next()) {
			manifest = versionRecord.getValue("manifest");

			if(!manifest)
				manifest = this._getManifestFromRepo(app_id, version, ignoreTransactionLimits);

			if(manifest) {
				versionRecord.setValue("manifest", manifest);
				versionRecord.update();

				try {
					manifest = new global.JSON().decode(manifest);
				} catch (e) {
					gs.error("Unable to convert manifest {0} to JSON object. Perhaps it's not valid? Error is {1}", manifest, e);
				}
			}
		}

		return manifest;
	},

	_getManifestFromRepo: function(/* string */ app_id, /* string */ version, /*boolean*/ ignoreTransactionLimits) {
		gs.info("Requesting app {0} manifest for version {1} from repo.", app_id, version);

		var request = new ScopedAppRepoRequest("get_app_preview");
		request.setParameter("source_app_id", app_id);
		request.setParameter("version", version);
		request.setParameter("ignore_transaction_limits", (ignoreTransactionLimits == true).toString());

		var manifest = request.get();
		var errorMsg = request.getErrorMessage();

		if (errorMsg) {
			gs.error("Unable to download manifest for source app {0} version {1}. Error is {2}", app_id, version, errorMsg);
			return;
		}

		return manifest;

	},

    type: 'ManifestService'
};
