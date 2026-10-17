var VersionComparator = Class.create();
VersionComparator.prototype = {

	initialize: function() {
		this.SNAPSHOT_KEYWORD = "SNAPSHOT";
		this.versionComparatorProperty = 'sn_appclient.version_comparator.use_backup';
		// Default value of this property is False.
		this.useBackupComparator = (gs.getProperty(this.versionComparatorProperty) === 'true');
	},
	
	isDowngrade: /*boolean */ function(/*from version*/ currentVersion, /* to version */ targetVersion) {
		// By default, use VersionComparatorUtil
		if (!this.useBackupComparator) {
			return VersionComparatorUtil.isDowngrade(currentVersion, targetVersion);
		}
		if (currentVersion.includes(this.SNAPSHOT_KEYWORD) || targetVersion.includes(this.SNAPSHOT_KEYWORD)) {
			var currentPart = currentVersion.split("-");
			var targetPart = targetVersion.split("-");
			if (currentPart[0].trim() == targetPart[0].trim())
				return  currentPart.length == 1;
		}
		currentVersion = currentVersion + '';
		targetVersion = targetVersion + '';
		var currentComponents = currentVersion.split('-')[0].split('.');		
		var targetComponents = targetVersion.split('-')[0].split('.');
		// 2.0 is a downgrade from 2.1
		// 3.0 is a downgrade from 1.0
		for (var i = 0; i < targetComponents.length; i++) {
			var targetComponent = parseInt(targetComponents[i], 10);
			var currentComponent = parseInt(i < currentComponents.length ? currentComponents[i] : 0, 10);
			if (targetComponent == currentComponent) 
				continue;

			return targetComponent < currentComponent;
		}
		//handle SNAPSHOT Version 1.0.0-1 vs 1.0.0-2
		var currentSnapshotComponent = currentVersion.split('-');
		var targetSnapshotComponent = targetVersion.split('-');
		if (currentSnapshotComponent.length == targetSnapshotComponent.length && targetSnapshotComponent.length == 2) {
			var targetSnapshotValue = parseInt(targetSnapshotComponent[1], 10);
			var currentSnapshotValue = parseInt(currentSnapshotComponent[1], 10);
			return targetSnapshotValue < currentSnapshotValue;
		}
		return targetSnapshotComponent.length < currentSnapshotComponent.length;
	},
	
	isUpgrade: function(/*string*/ currentVersion, /*string*/ targetVersion){
		// By default, use VersionComparatorUtil
		if (!this.useBackupComparator) {
		    return VersionComparatorUtil.isUpgrade(currentVersion, targetVersion);
		}
		//only an upgrade if it's not a downgrade and they aren't equal
		return (!this.isDowngrade(currentVersion, targetVersion) && !this.isEqual(currentVersion, targetVersion));
	},
	
	isEqual: function(/*string*/ currentVersion, /*string*/ targetVersion) {
		return currentVersion == targetVersion;
	},
	sortByVersion : function(currentVersion, targetVersion) {
		if(!this.isDowngrade(currentVersion.version, targetVersion.version))
			return -1;

		if(this.isDowngrade(currentVersion.version, targetVersion.version))
			return 1;

		return 0;
	},
	sortVersions : function(versionList){
		return versionList.sort(this.sortByVersion.bind(this));
	},
	
	//versionList array format : ["1.0.0", "1.2.0-3", "2.2.2-2"]
	getLatestVersion: function(versionList) {
		var latestVersion = versionList[0].toString();
		versionList.forEach(function(version) {
			if(this.isDowngrade(version, latestVersion))
				latestVersion = version;
		}.bind(this));
		return latestVersion;
	},
	
    type: 'VersionComparator'
};
