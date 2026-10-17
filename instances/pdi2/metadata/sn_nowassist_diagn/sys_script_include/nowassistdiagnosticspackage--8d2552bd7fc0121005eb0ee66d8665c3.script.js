var NowAssistDiagnosticsPackage = Class.create();
NowAssistDiagnosticsPackage.prototype = {

    initialize: function(packageSysID) {
        if (!packageSysID)
            throw 'Package Sys ID cannot be null';

        this._packageSysID = packageSysID;
        try {
            this._initializeAppIDToVersionMap();
            var diagnosticPackageGr = new GlideRecord('sn_nowassist_diagn_package');
            if (diagnosticPackageGr.get(packageSysID)) {
                this._packageName = diagnosticPackageGr.getValue('name');
                gs.info('Validating package: ' + this._packageName);
            }
        } catch(error) {
            throw 'Error initializing package: ' + error;
        }
    },

    getName: function() {
        return this._packageName;
    },

    /**
     * Returns a map of application id as key and version as value
     * @returns {*|{}}
     */
    getRequiredAppsVersionMap: function() {
        return this._appToVersionMap || {};
    },

    startValidation: function() {
		this._diagnosticMessageList = [];
    },

    validateAppInstallation: function(installedAppToVersionMap) {
        var appArtifactGr = new GlideRecord('sn_nowassist_diagn_app');
        appArtifactGr.addQuery('package', this._packageSysID);
        appArtifactGr.query();

        var appSysID;
        var expectedVersion;
        var actualVersion;
        var message = '';
        var resolutionMessage = '';
        var status;
        while (appArtifactGr.next()) {
            status = 'pass';
            appSysID = appArtifactGr.getValue('application_id');
            expectedVersion = appArtifactGr.getValue('version');
            actualVersion = installedAppToVersionMap[appSysID];
            if (gs.nil(actualVersion)) {
                message = 'Application ' + appArtifactGr.getValue('name') + ' is not installed!';
                resolutionMessage = 'Please install version ' + expectedVersion + ' of the application.';
                status = 'fail';
            } else if (!actualVersion.startsWith(expectedVersion)) {
                message = 'Application ' + appArtifactGr.getValue('name') + ': ' + 'Installed version: ' + actualVersion;
                resolutionMessage = 'Please install version ' + expectedVersion + ' of the app';
                status = 'fail';
            }

			if (status === 'fail')
				this._diagnosticMessageList.push(new DiagnosticMessage(message, resolutionMessage));
        }
    },

    endValidation: function() {

    },

	/**
	 * @returns [{DiagnosticMessage}]
	 */
	getDiagnosticMessageList: function() {
		return this._diagnosticMessageList;
	},

    _initializeAppIDToVersionMap: function() {
        this._appToVersionMap = this._getKeyValueMapForArtifactTable('sn_nowassist_diagn_app', 'application_id');
    },

    _getArtifactGr: function(artifactTableName) {
        var artifactGr = new GlideRecord(artifactTableName);
        artifactGr.addQuery('package', this._packageSysID);
        artifactGr.query();

        return artifactGr;
    },

    _getKeyValueMapForArtifactTable: function(tableName, artifactIdentifier) {
        var artifactToVersionMap = {};
        var artifactGr = this._getArtifactGr(tableName);
        while (artifactGr.next())
            artifactToVersionMap[artifactGr.getValue(artifactIdentifier)] = artifactGr.getValue('version');

        return artifactToVersionMap;
    },

    type: 'NowAssistDiagnosticsPackage'
};

NowAssistDiagnosticsPackage.getReleaseFamilyVersions = function() {
    var choiceList = new GlideChoiceList();

    var familyVersionsSupported = [
        {value: "glide-vancouver-patch4",label:"Vancouver Patch 4"},
        {value: "glide-vancouver-patch7",label:"Vancouver Patch 7"},
        {value: "glide-vancouver-patch8",label:"Vancouver Patch 8"},
        {value: "glide-vancouver-patch9",label:"Vancouver Patch 9"},
        {value: "glide-vancouver-patch10",label:"Vancouver Patch 10"},
        {value: "glide-washingtondc-patch0",label:"Washington DC"},
        {value: "glide-washingtondc-patch1",label:"Washington DC Patch 1"},
        {value: "glide-washingtondc-patch2",label:"Washington DC Patch 2"},
        {value: "glide-washingtondc-patch3",label:"Washington DC Patch 3"},
        {value: "glide-washingtondc-patch4",label:"Washington DC Patch 4"},
        {value: "glide-xanadu-patch0",label:"Xanadu"}
    ];

    familyVersionsSupported.forEach((familyVersionObject) => {
            choiceList.add(familyVersionObject.value, familyVersionObject.label);
        });
    
    return choiceList;
};
