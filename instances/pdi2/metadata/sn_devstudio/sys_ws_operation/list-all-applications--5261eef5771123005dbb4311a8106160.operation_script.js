(function process(request, response) {
    var repos,  
		linkedApps = {},
		allCustomApps = [],
		allInstalledStoreApps = [];

	if (typeof sn_vcs !== 'undefined' &&
		typeof sn_vcs.AppSourceControl !== 'undefined') {

		repos = sn_vcs.AppSourceControl.getRepositories();

		while (repos.next()) {
			linkedApps[repos.getSysAppSysId()] = {
				appId: repos.getSysAppSysId(),
				repoId: repos.getSysId(),
				url: repos.getRepositoryURL(),
				currentBranch: repos.getCurrentBranch(),
				sha: repos.getCurrentCommit(),
				shortDescription: repos.getShortDescription(),
				hasLocalChanges: repos.hasOutgoingChanges(),
				hasRemoteChanges: repos.hasIncomingChanges()
			};
		}
	}

	allCustomApps = _.map(getCustomApps(), function(app) {
		return _.extend(app, {vcs: linkedApps[app.sysId] || {}});
	});

	allInstalledStoreApps = _.map(getInstalledStoreApps(), function(app) {
		return _.extend(app, {vcs: linkedApps[app.sysId] || {}});
	});

	var allApps = allCustomApps.concat(allInstalledStoreApps);

	response.setStatus(200);
	response.setContentType('application/json');
	response.setBody({
		count: allApps.length,
		apps: allApps,
	});

	function getCustomApps() {
		var gr = new GlideRecord('sys_app'),
			apps = [];

		gr.orderByDesc('sys_created_on');
		gr.query();

		while (gr.next()) {
			if (gr.canRead())
				apps.push(getAppDetails(gr));
		}

		return apps;
	}

	function getInstalledStoreApps() {
		var appCustEnabled = sn_app_customization.AppCustomizationAPI.isAppCustomizationFeatureEnabled(),
		storeAppGR = new GlideRecord('sys_store_app'),
		apps = [];

        storeAppGR.addQuery('active', true);

    	if (appCustEnabled)
            storeAppGR.addQuery('private', false).addOrCondition('private', '');

        storeAppGR.orderByDesc('sys_created_on');
        storeAppGR.query();

        while(storeAppGR.next()) {
        	var appDetails = null;

        	if (storeAppGR.canRead()) {
        		if (appCustEnabled) {
        			appDetails = getAppDetailsWithAppCustFeatureEnabled(storeAppGR);
        		} else {
        			appDetails = getAppDetailsForAppCustFeatureDisabled(storeAppGR);
        		}
        	}

        	if (appDetails != null)
                apps.push(appDetails);
        }

		return apps;
	}

	function hasCustomization(appSysId) {
      if (hasInstalledAppCustomizations(appSysId))
          return true;

      if (sn_app_customization.AppCustomizationAPI.hasAppCustomizationFiles(appSysId))
          return true;

      return false;
	}

	function hasInstalledAppCustomizations(appSysId) {
		var appCustomizationGr = new GlideRecord("sys_app_customization");
		appCustomizationGr.addQuery("vendor_app", appSysId);
		appCustomizationGr.addQuery("version", "!=", "none");
		appCustomizationGr.query();
		return appCustomizationGr.hasNext();
	}

	//When app customization feature is enabled,
	//store apps are displayed if they are app customization capable and have a customization
	//When apps installed from plugins are not app customization capable,
	//they are dispayed when can_edit_in_studio = true
	function getAppDetailsWithAppCustFeatureEnabled(storeAppGR) {
		var appSysId = storeAppGR.getValue('sys_id');

		if(sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(appSysId)) {
		    if (hasCustomization(appSysId))
		        return getAppDetails(storeAppGR);
		}

		return null;
	}

	//When app customization feature is disabled,
	//the legacy behavior pre-Quebec is used,
	//any installed store app with can_edit_in_studio = true is displayed
	function getAppDetailsForAppCustFeatureDisabled(storeAppGR) {
        if(storeAppGR.isValidField('can_edit_in_studio')) {
            if(storeAppGR.getValue('can_edit_in_studio') == 1)
                return getAppDetails(storeAppGR);
        }

		return null;
	}

	function getAppDetails(app) {
		var logoid = new GlideRecord('sys_attachment'),
			details = {};

		logoid.addQuery('table_sys_id', app.sys_id);
		logoid.addQuery('file_name', 'logo');
		logoid.query();

		if (logoid.next())
			details.logo = logoid.sys_id + ".iix";

		details.sysId = app.getValue('sys_id');
		details.shortDescription = app.getValue('short_description') || '';
 		details.keyFeatures = app.getValue('key_features') || '';
 		details.releaseNotes = app.getValue('release_notes') || '';
 		details.name = app.name.toString();
 		details.vendor = app.getValue('vendor');
 		details.vendorPrefix = app.getValue('vendor_prefix');
 		details.link = app.getLink(true);
 		details.scope = app.getValue('scope');
 		details.active = !!app.getValue('active');

		var installDate = null;
		if (app.isValidField('install_date') && !app.install_date.nil()) {
			installDate = new GlideDate();
			installDate.setValue(app.getValue('install_date'));
		} else if (app.isValidField('version') && !gs.nil(app.version)) {
			installDate = new GlideDate();
			installDate.setValue(app.getValue('sys_created_on'));
		}

		var updateDate = '';
		details.recentUpdated = false;

		if (app.isValidField('update_date') && !app.update_date.nil()) {
			updateDate = new GlideDate();
			updateDate.setValue(app.getValue('update_date'));
			var thirtyDaysAgo = new GlideDate();
			thirtyDaysAgo.setValue(gs.daysAgoStart(30));
			details.hasUpdated = updateDate.compareTo(installDate) > 0;
			details.recentUpdated = !!(details.hasUpdated && updateDate.compareTo(thirtyDaysAgo) >= 0);
		}

		details.installDate = gs.nil(installDate) ? '' : installDate.getDisplayValue();
		details.updateDate = gs.nil(updateDate) ? '' : updateDate.getDisplayValue();

		var version;
		if (!gs.nil(app.version)) {
			version = app.getValue('version');
			details.version = version === '1.0' ? '1.0.0' : version;
			details.versionDisplay = getMajorAndMinorDisplayVersion(details.version);
		} else
			details.version = '';

		if (app.isValidField('assigned_version') && !gs.nil(app.assigned_version))
			details.assignedVersion = app.getValue('assigned_version');
		else
			details.assignedVersion = details.version;

		if (app.isValidField('latest_version') && !gs.nil(app.latest_version)) {
			details.latestVersion = app.getValue('latest_version');
			details.latestVersionDisplay = getMajorAndMinorDisplayVersion(details.latestVersion);

			if (details.version !== details.latestVersion && details.versionDisplay === details.latestVersionDisplay)
				 details.latestVersionDisplay = details.latestVersion;
		} else {
			details.latestVersion = details.version;
			details.latestVersionDisplay = details.versionDisplay;
		}


		details.sysUpdatedOn = app.getDisplayValue('sys_updated_on');
		details.sysCreatedOn = app.getDisplayValue('sys_created_on');

		var createdOn = new GlideDate();

		createdOn.setValue(app.getValue('sys_created_on'));
		details.sysCreatedOnDisplay = createdOn.getDisplayValue();

		var displayDate = new GlideDate();
		var publishDate = app.isValidField('publish_date') && !app.publish_date.nil() ? app.getValue('publish_date') : app.getValue('sys_updated_on');

		displayDate.setValue(publishDate);
		details.displayDate = displayDate.getDisplayValue();

		return details;
	}

	function getMajorAndMinorDisplayVersion(val) {
		var ary = val.toString().split('.');
		if (ary.length <= 1)
			return val;

		if (ary[ary.length - 1].length >= 12)
			return val;

		if (ary.length >= 2 && ary[0] === 0 && ary[1] === 0)
			return val;

		return ary[0]+'.'+ary[1];
	}

})(request, response);
