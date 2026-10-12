var NowAssistDiagnosticsPackageInstallValidator = Class.create();

NowAssistDiagnosticsPackageInstallValidator.validateAll = function() {
	var packageList = [];
	var requiredApplicationIDList = [];
	var diagnosticMessageList = [];
	try {
		packageList = getPackageListForInstance();
	} catch(error) {
		diagnosticMessageList.push(new DiagnosticMessage('Plugin information cannot be determined: ' + error, 'Make sure this is not an internal instance'));
		return diagnosticMessageList;
	}

	var currentPackage;
	for (var i = 0; i < packageList.length; i++) {
		currentPackage = packageList[i];
		// If there is any error fetching app version infos for one package, we must continue with the next
		try {
			var requiredAppToVersionMap = currentPackage.getRequiredAppsVersionMap();
			requiredApplicationIDList = requiredApplicationIDList.concat(Object.keys(requiredAppToVersionMap));
		} catch(error) {
			diagnosticMessageList.push(new DiagnosticMessage('Error fetching app info for package: ' + currentPackage.getName() + ': ' + error))
		}
	}

	var installedArtifactIDVersionMap = getInstalledArtifactIDVersionMap(requiredApplicationIDList);
	for (i = 0; i < packageList.length; i++) {
		currentPackage = packageList[i];
		currentPackage.startValidation();
		currentPackage.validateAppInstallation(installedArtifactIDVersionMap);
		currentPackage.endValidation();
		diagnosticMessageList = diagnosticMessageList.concat(currentPackage.getDiagnosticMessageList());
	}

	return diagnosticMessageList;
};

function getInstalledArtifactIDVersionMap(requiredArtifactIDList) {
	var artifactGr = new GlideRecord('v_plugin');
	artifactGr.addQuery('id', 'IN', requiredArtifactIDList.join(','));
	artifactGr.addQuery('active', '!=', 'inactive');
	artifactGr.query();

	var returnMap = {};
	while (artifactGr.next())
		returnMap[artifactGr.getValue('id')] = artifactGr.getValue('version');

	return returnMap;
}

function getPackageListForInstance() {

	var packageList = [];
	// rawPlatformVersion will be of the form: glide-vancouver-07-06-2023__patch8-03-05-2024_03-14-2024_0941
	// we will have to parse it to the choice format we have. The above one will be glide
	var rawPlatformVersion = gs.getProperty('glide.war');
	var platformVersion;
	var isPatchVersion = true;
	if (!gs.nil(rawPlatformVersion)) {
		try {
			var platformVersionComponents = rawPlatformVersion.split('__');
			// first component will be of the form glide-vancouver-07-06-2023, second one will be patch8-03-05-2024_03-14-2024_0941
			// We need to form glide-vancouver-patch8 from the above components
			// If it is a non patch version, the format will be glide-xanadu-07-02-2024_08-12-2024_1800. We need to get glide-xanadu from it
			if (platformVersionComponents.length == 1) {
				isPatchVersion = false;
				platformVersionComponents = rawPlatformVersion.split('_');
			} if (platformVersionComponents.length != 2)
				throw 'Invalid format. Platform version components length is not 2';

			var glideComponents = platformVersionComponents[0].trim().split('-');
			if (glideComponents.length < 2)
				throw 'Invalid glide components. Platform version might not be present';

			var patchInfoComponents = platformVersionComponents[1].trim().split('-');
			if (glideComponents.length < 1)
				throw 'Invalid patch components. Patch version might not be present';

			platformVersion = glideComponents[0] + '-' + glideComponents[1];
			if (isPatchVersion)
				platformVersion = platformVersion + '-' + patchInfoComponents[0];
		} catch(error) {
			throw('Error parsing platform version: ' + rawPlatformVersion + '. Error: ' + error);
		}
	}

	var diagnosticPackageGr = new GlideRecord('sn_nowassist_diagn_package');
	diagnosticPackageGr.addQuery('release_family', platformVersion);
	diagnosticPackageGr.query();

	while (diagnosticPackageGr.next())
		packageList.push(new NowAssistDiagnosticsPackage(diagnosticPackageGr.getValue('sys_id')))

	return packageList;
}
