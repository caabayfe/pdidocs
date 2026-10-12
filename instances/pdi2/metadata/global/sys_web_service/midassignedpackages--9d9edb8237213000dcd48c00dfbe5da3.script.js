/*
 * This page is public.
 * DO NOT change this schema other than by adding elements, as it is used by MID servers
 * and any change could cause MID server upgrade failures.
 *
 * Result payload format example:
 * result: {
 *   midPackage: [
 *     { filename: string, url: string[] },..
 *   ],
 * } 
 */

var MidAssignedPackages = function() {};

/**
 * Processes the request.
 * @return XMLDoc response
 */
MidAssignedPackages.prototype.process = function(request) {
	var glideWar = gs.getProperty('glide.war');
	var glideAssignedWar = gs.getProperty('glide.war.assigned');
	var glideWarNoUpgrade = gs.getProperty('glide.war.no_upgrade');
	var jreVersion = '21.0.11-sncmid1';
	var glibcVersionMinRquirement = '2.17';

	// PRB1344057: In the case of roll back glideWar != glideAssignedWar and we want to continue
	// MID upgrade. Checking glide.war.no_upgrade guarantees platform upgrade is not in progress
	var isRollBack = (!gs.nil(glideWarNoUpgrade)) && (glideWarNoUpgrade == glideAssignedWar);
	if (!gs.nil(glideWar) && !gs.nil(glideAssignedWar) && glideWar != glideAssignedWar && !isRollBack)
		return { result: { error: 'Platform upgrade is currently in progress.' } };

	var result = { 'result': { midPackage: [] }};
	var buildstamp = gs.getProperty('mid.buildstamp');
	var versionOverride = gs.getProperty('mid.version.override');
	if (buildstamp == null)
		buildstamp = '';
	if (versionOverride)
		buildstamp = versionOverride;

	var midSysId = request.mid_id;
	// apply a pinned version if configured
	// try the config table first, then the property table if nothing is found
	if (!gs.nil(request.mid_id)) {
		var configGr = new GlideRecord('ecc_agent_config');
		configGr.addQuery('ecc_agent', midSysId);
		configGr.addQuery('param_name', 'mid.pinned.version');
		configGr.addNotNullQuery('value');
		configGr.setLimit(1);
		configGr.query();
		if (configGr.next()) {
			buildstamp = configGr.value;
		} else { // try using mid properties
			var propGr = new GlideRecord('ecc_agent_property');
			propGr.addQuery('ecc_agent', midSysId);
			propGr.addQuery('name', 'mid.pinned.version');
			propGr.addNotNullQuery('value');
			propGr.setLimit(1);
			propGr.query();
			if (propGr.next()) {
				buildstamp = propGr.value;
			} else { // try using mid property with no mid referenced
				var propGr = new GlideRecord('ecc_agent_property');
				propGr.addQuery('name', 'mid.pinned.version');
				propGr.addQuery('ecc_agent', null);
				propGr.addNotNullQuery('value');
				propGr.setLimit(1);
				propGr.query();
				if (propGr.next())
					buildstamp = propGr.value;
			}
		}
	}

	// build a list of packages currently assigned to the MID
	var packages = [
		new MIDPackage('mid-core', buildstamp, 'universal', 'universal'),
		new MIDPackage('mid-upgrade', buildstamp, 'universal', 'universal')
	];
	
	// Check whether arch is 32-bit
	var is32bit = false;
	// Need to check arch since we removed arch in London
	if (JSUtil.notNil(request.arch)) {
		if (request.os.includes('linux')) {
			// Linux 32-bit returns 'universal' when using SystemUtils.OS_ARCH
			// We use the jre properties meta file for architecture information
			// after the initial upgrade so this should only happen once
			if (request.arch == "universal")
				request.arch = "x86-32";
		}
		if (request.arch.includes('x86-32')) {
			is32bit = true;
		}
	}

	if (is32bit) {
		var mid32BitHost = '32 bit MID servers are not supported. Please refer to KB0863694 for more information.';
		MIDServerUtil.createOrUpdateIssue(midSysId, 'MIDAssignedPackages', mid32BitHost);
	}


	// only assign a jre if needed, as it's a large download
	// if jre_version is null, agent/jre does not exist. otherwise, it does and we check that version
	// DEF0136092: Download jre package if bundled mid jre version and installed mid jre version does not match (downgrade support).
	if (JSUtil.notNil(request.os) && (JSUtil.nil(request.jre_version) ||
			jreVersion != request.jre_version.trim())) {
		var includeJrePkg = true;
		if (request.os.includes('linux')) {

			// Skip jre upgrade for Linux 32-bit MID Server.
			if (is32bit) {
				includeJrePkg = false;
				var linux32BitHost = 'JRE will not be upgarded on 32 bit Linux host machine.';
				MIDServerUtil.createOrUpdateIssue(midSysId, 'MIDAssignedPackages', linux32BitHost);
			}

			// Skip jre upgarde for glibc lower than 2.17 in Linux
			var gr = new GlideRecord('ecc_agent');
			gr.get('sys_id', midSysId);
			var glibcVersion = gr.getValue('host_glibc_version');

			if (!gs.nil(glibcVersion) && glibcVersion.localeCompare(glibcVersionMinRquirement) < 0) {
				includeJrePkg = false;
				var glibcIssue = 'JRE will not be upgarded. Host glibc version does not meet minimum glibc requirement (2.17). Host glibc version is : ' + glibcVersion;
				MIDServerUtil.createOrUpdateIssue(midSysId, 'MIDAssignedPackages', glibcIssue);
			}
		}

		var midBuildstamp = getCurrentMidBuildstamp(request.installed_packages);
		if (midBuildstamp == buildstamp)
			includeJrePkg = false;

		if (includeJrePkg) {
			packages.push(new MIDPackage('mid-jre', buildstamp, request.os, request.arch));
		}
	}

	// build a list of URLs to download each package from, this will be passed to the MID
	for (var i = 0; i < packages.length; ++i) {
		var pack = packages[i];
		var uriFactory = new MIDPackageUriFactory(pack,'auto_upgrade');
		uriFactory.setMidSysId(midSysId);
		result.result.midPackage.push({
			'filename': pack.getLegacyFilename(),
			'url': uriFactory.getUris()
		});
	}

	return result;
};

function getCurrentMidBuildstamp(installed_packages) {
	var packages = installed_packages.split('comma');
	for(var i = 0; i < packages.length; i++) {
		var pack = packages[i];
		if(pack.includes('mid-core')) {
			return pack.split('.')[1];
		}
	}
	return '';
}

// driver
response.response = new XMLHelper().toXMLDoc(new MidAssignedPackages().process(request));
