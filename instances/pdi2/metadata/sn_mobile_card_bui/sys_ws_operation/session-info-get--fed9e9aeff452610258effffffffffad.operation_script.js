(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    const sessionInfo = {};
	
    function scrubFamilyVersion(familyVersion) {
        var specialCharactersRemoved = familyVersion.replace(/[^\w\s]/gi, '');
        return specialCharactersRemoved.trim().toLowerCase();
    }

    function determineFamilyVersion(familyVersion) {
        var scrubbedFamilyVersion = scrubFamilyVersion(familyVersion);
        for (var i = 0; i < validVersions.length; i++) {
            var validVersion = validVersions[i];
            if (scrubbedFamilyVersion.includes(validVersion)) return validVersion;
        }
        return fallBackVersion;
    }

    function getFamilyVersion() {
        var rawFamilyVersion = gs.getProperty('glide.buildname');
        return determineFamilyVersion(rawFamilyVersion);
    }

    const validVersions = ['australia', 'zurich', 'yokohama', 'xanadu', 'washington', 'vancouver'];
    const fallBackVersion = 'xanadu';
    const familyVersionMap = {
        australia: 29,
        zurich: 28,
        yokohama: 27,
        xanadu: 26,
        washington: 25,
        vancouver: 24,
    };
    const buildNameKey = 'glide.buildname';
    const familyVersionNumberKey = 'glide.familyVersionNumber';
    const rawFamilyVersion = gs.getProperty(buildNameKey);
    const familyVersion = determineFamilyVersion(rawFamilyVersion);
    sessionInfo[buildNameKey] = familyVersion;
    sessionInfo[familyVersionNumberKey] =
        familyVersionMap[familyVersion];
    return sessionInfo;
})(request, response);
