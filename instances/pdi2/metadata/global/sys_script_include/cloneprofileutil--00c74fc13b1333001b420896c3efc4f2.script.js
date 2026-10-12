var CloneProfileUtil = Class.create();
CloneProfileUtil.prototype = {
	initialize: function() {
	},
	type: 'CloneProfileUtil'
};

/**
 * Duplicates the clone profile. Duplicates the relationships with clone profiles too.
 * @param sourceProfile
 * @param targetProfile
 */
CloneProfileUtil.duplicateProfile = function(sourceProfile, targetProfile) {
	if(gs.nil(sourceProfile) || gs.nil(targetProfile))
		return;
	
	// Copying Exclusion List
	var profileExclusionGr = new GlideRecord('clone_profile_exclusions');
	profileExclusionGr.addQuery('profile', sourceProfile);
	profileExclusionGr.query();
	
	while(profileExclusionGr.next()) {
		profileExclusionGr.setValue('profile', targetProfile);
		profileExclusionGr.insert();
	}
	
	// Copying Preserver List
	var profilePreserverGr = new GlideRecord('clone_profile_preservers');
	profilePreserverGr.addQuery('profile', sourceProfile);
	profilePreserverGr.query();
	
	while(profilePreserverGr.next()) {
		profilePreserverGr.setValue('profile', targetProfile);
		profilePreserverGr.insert();
	}
	
	// Copying Cleanup Scripts List
	var profileCleanupScriptGr = new GlideRecord('clone_profile_cleanup_scripts');
	profileCleanupScriptGr.addQuery('profile', sourceProfile);
	profileCleanupScriptGr.query();
	
	while(profileCleanupScriptGr.next()) {
		profileCleanupScriptGr.setValue('profile', targetProfile);
		profileCleanupScriptGr.insert();
	}
};

/**
 * Gets the default clone profile.
 * @return cloneProfileGr  GlideRecord
 */
CloneProfileUtil.getDefaultProfile = function() {
	var cloneProfileGr = new GlideRecord('clone_profile');
	cloneProfileGr.addQuery('default_profile', true);
	cloneProfileGr.query();
	
	if(cloneProfileGr.next())
		return cloneProfileGr;
	
	return '';
};

/**
 * Builds the default profile configuration.
 * @param profileSysId String
 */
CloneProfileUtil.buildDefaultProfileConfig = function(profileSysId) {
	if(gs.nil(profileSysId))
		return;
	
	if(gs.getSession().getClientData('sn_clone_is_duplicate') == 'true')
		return;
};

/**
 * Builds the default profile preservers list.
 * @param profileSysId String
 */
CloneProfileUtil.buildDefaultPreserverList = function(profileSysId) {
	if(gs.nil(profileSysId))
		return;
	
	var clonePreserverGr = new GlideRecord(CloneConstants.tableName.CLONE_DATA_PRESERVER);
	clonePreserverGr.addQuery('include_in_system_clone', true);
	clonePreserverGr.addQuery('default', false);
	clonePreserverGr.query();
	
	while(clonePreserverGr.next()) 
		CloneProfileUtil.createProfilePreserver(profileSysId, clonePreserverGr.getValue('sys_id'));
};

/**
 * Builds the default profile exclusions list.
 * @param profileSysId String
 */
CloneProfileUtil.buildDefaultExclusionList = function(profileSysId) {
	if(gs.nil(profileSysId))
		return;
	
	var cloneExclusionGr = new GlideRecord(CloneConstants.tableName.CLONE_DATA_EXCLUSION);
	cloneExclusionGr.addQuery('include_in_system_clone', true);
	cloneExclusionGr.addQuery('default', false);
	cloneExclusionGr.query();
	
	while(cloneExclusionGr.next()) 
		CloneProfileUtil.createProfileExclusion(profileSysId, cloneExclusionGr.getValue('sys_id'));
};

/**
 * Builds the default profile cleanup scripts list.
 * @param profileSysId String
 */
CloneProfileUtil.buildDefaultCleanupScriptList = function(profileSysId) {
	if(gs.nil(profileSysId))
		return;
	
	var cleanupScriptGr = new GlideRecord(CloneConstants.tableName.CLONE_CLEANUP_SCRIPT);
	cleanupScriptGr.addQuery('include_in_system_clone', true);
	cleanupScriptGr.addQuery('default', false);
	cleanupScriptGr.query();
	
	while(cleanupScriptGr.next()) 
		CloneProfileUtil.createProfileCleanupScript(profileSysId, cleanupScriptGr);
};

/**
 * Creates the profile and preserver relationship.
 * @param profile String
 * @param preserver String
 */
CloneProfileUtil.createProfilePreserver = function(profile, preserver) {
	var profilePreserverGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_PRESERVER);
	profilePreserverGr.initialize();
	
	profilePreserverGr.setValue('profile', profile);
	profilePreserverGr.setValue('preserver', preserver);
	profilePreserverGr.insert();
};

/**
 * Creates the profile and exclusion relationship.
 * @param profile String
 * @param exclusion String
 */
CloneProfileUtil.createProfileExclusion = function(profile, exclusion) {
	var profileExclusionGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_EXCLUSION);
	profileExclusionGr.initialize();
	
	profileExclusionGr.setValue('profile', profile);
	profileExclusionGr.setValue('exclusion', exclusion);
	profileExclusionGr.insert();
};

/**
 * Creates the profile and cleanup scripts relationship.
 * @param profile String
 * @param cleanupscriptGr GlideRecord
 */
CloneProfileUtil.createProfileCleanupScript = function(profile, cleanupScriptGr) {
	var profileCleanupScriptGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT);
	profileCleanupScriptGr.initialize();
	
	profileCleanupScriptGr.setValue('profile', profile);
	profileCleanupScriptGr.setValue('cleanup_script', cleanupScriptGr.getValue('sys_id'));
	profileCleanupScriptGr.setValue('order', cleanupScriptGr.getValue('order'));
	profileCleanupScriptGr.setValue('active', cleanupScriptGr.getValue('active'));
	profileCleanupScriptGr.insert();
};
