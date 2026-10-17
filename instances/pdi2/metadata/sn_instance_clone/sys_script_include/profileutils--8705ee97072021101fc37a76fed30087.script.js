var ProfileUtils = Class.create();
var _extractHost = function(url) {
    var m = String(url || '').match(/^https?:\/\/([^\/]+)/i);
    return m ? m[1] : String(url || '');
};
var _getAccessTokenForInstance = function(instanceUrl) {
    if (gs.nil(instanceUrl)) return null;

    var requestorId = CloneConstants.oAuthAppConstants.REQUESTOR_ID;
    var providerName = CloneConstants.oAuthAppConstants.APP_PROVIDER_NAME + ' - ' + _extractHost(instanceUrl);

    var pGr = new GlideRecord('oauth_entity');
    pGr.addQuery('name', providerName);
    pGr.setLimit(1);
    pGr.query();
    if (!pGr.next()) return null;

    var prGr = new GlideRecord('oauth_entity_profile');
    prGr.addQuery('oauth_entity', pGr.getValue('sys_id'));
    prGr.addQuery('default', true);
    prGr.setLimit(1);
    prGr.query();
    if (!prGr.next()) return null;

    var token = new sn_auth.GlideOAuthClient().getToken(requestorId, prGr.getValue('sys_id'));
    if (token == null) return null;

    var accessToken = token.getAccessToken();
    return gs.nil(accessToken) ? null : String(accessToken);
};
ProfileUtils.prototype = {
    initialize: function() {},
    type: 'ProfileUtils'
};

/**
 * Fetches the clone profile options from the instance.
 * @param instance_url
 * @param user
 * @param password
 */
ProfileUtils.fetchProfilesFromInstance = function(instance_url, user, password) {
    var response = {
        isError: true,
        isByOAuth: false,
        message: '',
        profiles: []
    };

    var endPointUrl, token;

    if (gs.nil(instance_url)) {
        response.message = 'Missing Mandatory parameters.';
        return response;
    }

    if (!instance_url.endsWith('/'))
        endPointUrl = instance_url + '/api/now/table/clone_profile?sysparm_query=ORDERBYname';
    else
        endPointUrl = instance_url + 'api/now/table/clone_profile?sysparm_query=ORDERBYname';

    try {
        var json = new global.JSON();
        var request = new sn_ws.RESTMessageV2();
        request.setEndpoint(endPointUrl);
        request.setHttpMethod('GET');
        if (!password) {
            token = _getAccessTokenForInstance(instance_url);
            if (!token)
                throw "No access token found for: " + instance_url;
            else
                request.setRequestHeader('Authorization', 'Bearer ' + token);
        } else {
            request.setBasicAuth(user, password);
        }
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");
        var resp = request.execute();
        if (gs.nil(resp.getBody())) {
            response.message = 'Unable to fetch profiles or options from : ' + instance_url;
            return response;
        }

        var body = json.decode(resp.getBody());
        if (gs.nil(body)) {
            response.message = 'Unable to find any profiles or options from : ' + instance_url;
            return;
        }

        var cloneProfileData = body.result;
        if (!gs.nil(cloneProfileData) && cloneProfileData.length > 0) {
            for (var idx = 0; idx < cloneProfileData.length; idx++) {
                var cloneProfile = {};
                cloneProfile.name = cloneProfileData[idx].name.toString();
                cloneProfile.exclude_all_from_exclusion_list = cloneProfileData[idx].exclude_all_from_exclusion_list || true;
                cloneProfile.filter_attachment_data = cloneProfileData[idx].filter_attachment_data || true;
                cloneProfile.exclude_large_data = cloneProfileData[idx].exclude_large_data || true;
                cloneProfile.preserve_theme = cloneProfileData[idx].preserve_theme || true;
                cloneProfile.preserve_in_progress_update_sets = cloneProfileData[idx].preserve_in_progress_update_sets || '';
                cloneProfile.amount_of_data_copied_from_large_tables = cloneProfileData[idx].amount_of_data_copied_from_large_tables || 'full';
                cloneProfile.default_profile = cloneProfileData[idx].default_profile;
                cloneProfile.backupTypeFromCloneProfileDefaultSelectedItem = cloneProfileData[idx].backup_type;
                cloneProfile.sysId = cloneProfileData[idx].sys_id;
                response.profiles.push(cloneProfile);
            }

            response.isError = false;
            if (token)
                response.isByOAuth = true;
        } else
            response.message = 'Unable to authenticate. Please provide correct credentials.';
    } catch (e) {
        response.message = 'Unable to fetch profiles or options from : ' + instance_url;
    }

    return response;
};

/**
 * Fetches the config (exclusions/preservers/cleanup scripts) from local instance.
 * @param profileName - Profile Name
 */
ProfileUtils.buildConfigCountFromLocalInstance = function(profileName) {
    var result = {
        isError: false,
        message: '',
        exclusion: {
            count: 0,
            link: ''
        },
        preserver: {
            count: 0,
            link: ''
        },
        cleanupScript: {
            count: 0,
            link: ''
        },
    };

    var currentInstanceUrl = gs.getProperty('glide.servlet.uri');
    if (gs.nil(profileName)) {
        var exclusionGr = new GlideAggregate(CloneConstants.tableName.CLONE_DATA_EXCLUSION);
        exclusionGr.addAggregate('COUNT');
        exclusionGr.query();
        if (exclusionGr.next()) {
            result.exclusion.count = exclusionGr.getAggregate('COUNT');
            result.exclusion.link = currentInstanceUrl + CloneConstants.tableName.CLONE_DATA_EXCLUSION + '_list.do';
        }

        var preserverGr = new GlideAggregate(CloneConstants.tableName.CLONE_DATA_PRESERVER);
        preserverGr.addAggregate('COUNT');
        preserverGr.query();
        if (preserverGr.next()) {
            result.preserver.count = preserverGr.getAggregate('COUNT');
            result.preserver.link = currentInstanceUrl + CloneConstants.tableName.CLONE_DATA_PRESERVER + '_list.do';
        }

        var cleanupScriptGr = new GlideAggregate(CloneConstants.tableName.CLONE_CLEANUP_SCRIPT);
        cleanupScriptGr.addQuery('active', true);
        cleanupScriptGr.addAggregate('COUNT');
        cleanupScriptGr.query();
        if (cleanupScriptGr.next()) {
            result.cleanupScript.count = cleanupScriptGr.getAggregate('COUNT');
            result.cleanupScript.link = currentInstanceUrl + CloneConstants.tableName.CLONE_CLEANUP_SCRIPT + '_list.do?sysparm_query=active%3Dtrue';
        }

    } else {
        var encodedQuery = 'profile.name=System Profile^ORprofile.name=' + profileName;
        var profileExclusionGr = new GlideAggregate(CloneConstants.tableName.CLONE_PROFILE_EXCLUSION);
        profileExclusionGr.addEncodedQuery(encodedQuery, true);
        profileExclusionGr.addAggregate('COUNT');
        profileExclusionGr.query();
        if (profileExclusionGr.next()) {
            result.exclusion.count = profileExclusionGr.getAggregate('COUNT');
            result.exclusion.link = currentInstanceUrl + CloneConstants.tableName.CLONE_PROFILE_EXCLUSION + '_list.do?&sysparm_query=' + encodeURIComponent(encodedQuery);
        }

        var profilePreserverGr = new GlideAggregate(CloneConstants.tableName.CLONE_PROFILE_PRESERVER);
        profilePreserverGr.addEncodedQuery(encodedQuery, true);
        profilePreserverGr.addAggregate('COUNT');
        profilePreserverGr.query();
        if (profilePreserverGr.next()) {
            result.preserver.count = profilePreserverGr.getAggregate('COUNT');
            result.preserver.link = currentInstanceUrl + CloneConstants.tableName.CLONE_PROFILE_PRESERVER + '_list.do?&sysparm_query=' + encodeURIComponent(encodedQuery);
        }

        var cloneProfileCleanupScriptsGr = new GlideAggregate(CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT);
        cloneProfileCleanupScriptsGr.addEncodedQuery(encodedQuery, true);
        cloneProfileCleanupScriptsGr.addQuery('active', true);
        cloneProfileCleanupScriptsGr.addAggregate('COUNT');
        cloneProfileCleanupScriptsGr.query();
        if (cloneProfileCleanupScriptsGr.next()) {
            result.cleanupScript.count = cloneProfileCleanupScriptsGr.getAggregate('COUNT');
            result.cleanupScript.link = currentInstanceUrl + CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT + '_list.do?&sysparm_query=' + encodeURIComponent('active=true^' + encodedQuery);
        }
    }

    return result;
};

/**
 * Fetches the config (exclusions/preservers/cleanup scripts) from remote instance.
 * @param instanceUrl
 * @param user
 * @param password
 * @param profileName
 */
ProfileUtils.buildConfigCountFromRemoteInstance = function(instanceUrl, user, password, profileName) {
    var instanceLink,
        token,
        encodedQuery = '',
        tableNamesJson = {},
        response = {
            isError: true,
            message: '',
            exclusion: {
                count: 0,
                link: ''
            },
            preserver: {
                count: 0,
                link: ''
            },
            cleanupScript: {
                count: 0,
                link: ''
            },
        };

    if (gs.nil(instanceUrl)) {
        response.message = 'Missing Mandatory parameters.';
        return response;
    }

    if (!instanceUrl.endsWith('/'))
        instanceUrl = instanceUrl + "/";

    instanceLink = instanceUrl + 'api/sn_instance_clone/profile_config_count_api/fetchcount';

    try {
        var json = new global.JSON();
        var request = new sn_ws.RESTMessageV2();
        request.setEndpoint(instanceLink);
        request.setHttpMethod('GET');
        if (!password) {
            token = _getAccessTokenForInstance(instanceUrl);
            if (!token)
                throw "No access token found for: " + instanceUrl;
            else
                request.setRequestHeader('Authorization', 'Bearer ' + token);
        } else {
            request.setBasicAuth(user, password);
        }
        request.setRequestHeader("Content-Type", "application/json");
        request.setRequestHeader("Accept", "application/json");
        request.setQueryParameter('profileName', profileName);

        var resp = request.execute();
        var body = json.decode(resp.getBody());
        var result = body.result;
        response.exclusion = result.exclusion;
        response.preserver = result.preserver;
        response.cleanupScript = result.cleanupScript;
        response.isError = false;
    } catch (e) {
        gs.info('Issue with accessing ' + instanceUrl);
    }

    if (response.isError == false)
        return response;

    // Fetching via table level api's
    try {
        if (!gs.nil(profileName)) {
            encodedQuery = encodeURIComponent('profile.name=System Profile^ORprofile.name=' + profileName);

            tableNamesJson['exclusionCount'] = CloneConstants.tableName.CLONE_PROFILE_EXCLUSION;
            response.exclusion.link = instanceUrl + CloneConstants.tableName.CLONE_PROFILE_EXCLUSION + '_list.do?&sysparm_query=' + encodedQuery;

            tableNamesJson['preserverCount'] = CloneConstants.tableName.CLONE_PROFILE_PRESERVER;
            response.preserver.link = instanceUrl + CloneConstants.tableName.CLONE_PROFILE_PRESERVER + '_list.do?&sysparm_query=' + encodedQuery;

            tableNamesJson['cleanupScriptCount'] = CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT;
            response.cleanupScript.link = instanceUrl + CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT + '_list.do?&sysparm_query=' + encodeURIComponent('active=true^') + encodedQuery;
        } else {
            tableNamesJson['exclusionCount'] = CloneConstants.tableName.CLONE_DATA_EXCLUSION;
            response.exclusion.link = instanceUrl + CloneConstants.tableName.CLONE_DATA_EXCLUSION + '_list.do';

            tableNamesJson['preserverCount'] = CloneConstants.tableName.CLONE_DATA_PRESERVER;
            response.preserver.link = instanceUrl + CloneConstants.tableName.CLONE_DATA_PRESERVER + '_list.do';

            tableNamesJson['cleanupScriptCount'] = CloneConstants.tableName.CLONE_CLEANUP_SCRIPT;
            response.cleanupScript.link = instanceUrl + CloneConstants.tableName.CLONE_CLEANUP_SCRIPT + '_list.do?sysparm_query=active%3Dtrue';
        }

        for (var key in tableNamesJson) {
            if (tableNamesJson.hasOwnProperty(key)) {
                instanceLink = instanceUrl + 'api/now/table/' + tableNamesJson[key] + '?sysparm_fields=sys_id' + (gs.nil(encodedQuery) ? '' : '&sysparm_query=' + encodedQuery);

                request = new sn_ws.RESTMessageV2();
                request.setEndpoint(instanceLink);
                request.setHttpMethod('GET');
                if (!password) {
                    token = _getAccessTokenForInstance(instance_url);
                    if (!token)
                        throw "No access token found for: " + instance_url;
                    else
                        request.setRequestHeader('Authorization', 'Bearer ' + token);
                } else {
                    request.setBasicAuth(user, password);
                }
                request.setRequestHeader("Content-Type", "application/json");
                request.setRequestHeader("Accept", "application/json");
                resp = request.execute();
                tableNamesJson[key] = gs.nil(resp.getHeader('X-Total-Count')) ? '' : resp.getHeader('X-Total-Count');
            }
        }

        response.exclusion.count = tableNamesJson['exclusionCount'];
        response.preserver.count = tableNamesJson['preserverCount'];
        response.cleanupScript.count = tableNamesJson['cleanupScriptCount'];

        response.isError = false;

    } catch (e) {
        response.isError = true;
        response.message = 'Unable to find count of exclusions/preservers/cleanup scripts from : ' + instanceUrl;
    }

    return response;
};

/**
 * Builds the default profile preservers list.
 * @param profileSysId String
 */
ProfileUtils.buildDefaultPreserverList = function(profileSysId) {
    if (gs.nil(profileSysId))
        return;

    var clonePreserverGr = new GlideRecord(CloneConstants.tableName.CLONE_DATA_PRESERVER);
    clonePreserverGr.addQuery('include_in_system_clone', true);
    clonePreserverGr.addQuery('default', false);
    clonePreserverGr.query();

    while (clonePreserverGr.next())
        ProfileUtils.createProfilePreserver(profileSysId, clonePreserverGr.getValue('sys_id'));
};

/**
 * Builds the default profile exclusions list.
 * @param profileSysId String
 */
ProfileUtils.buildDefaultExclusionList = function(profileSysId) {
    if (gs.nil(profileSysId))
        return;

    var cloneExclusionGr = new GlideRecord(CloneConstants.tableName.CLONE_DATA_EXCLUSION);
    cloneExclusionGr.addQuery('include_in_system_clone', true);
    cloneExclusionGr.addQuery('default', false);
    cloneExclusionGr.query();

    while (cloneExclusionGr.next())
        ProfileUtils.createProfileExclusion(profileSysId, cloneExclusionGr.getValue('sys_id'));
};

/**
 * Builds the default profile cleanup scripts list.
 * @param profileSysId String
 */
ProfileUtils.buildDefaultCleanupScriptList = function(profileSysId) {
    if (gs.nil(profileSysId))
        return;

    var cleanupScriptGr = new GlideRecord(CloneConstants.tableName.CLONE_CLEANUP_SCRIPT);
    cleanupScriptGr.addQuery('include_in_system_clone', true);
    cleanupScriptGr.addQuery('default', false);
    cleanupScriptGr.query();

    while (cleanupScriptGr.next())
        ProfileUtils.createProfileCleanupScript(profileSysId, cleanupScriptGr);
};

/**
 * Creates the profile and preserver relationship.
 * @param profile String
 * @param preserver String
 */
ProfileUtils.createProfilePreserver = function(profile, preserver) {
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
ProfileUtils.createProfileExclusion = function(profile, exclusion) {
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
ProfileUtils.createProfileCleanupScript = function(profile, cleanupScriptGr) {
    var profileCleanupScriptGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT);
    profileCleanupScriptGr.initialize();

    profileCleanupScriptGr.setValue('profile', profile);
    profileCleanupScriptGr.setValue('cleanup_script', cleanupScriptGr.getValue('sys_id'));
    profileCleanupScriptGr.setValue('order', cleanupScriptGr.getValue('order'));
    profileCleanupScriptGr.setValue('active', cleanupScriptGr.getValue('active'));
    profileCleanupScriptGr.insert();
};

ProfileUtils.duplicateProfile = function(sourceProfile, targetProfile) {
    if (gs.nil(sourceProfile) || gs.nil(targetProfile))
        return;
    if (sourceProfile === CloneConstants.SYSTEM_PROFILE_SYS_ID)
        return;
    // Copy Exclusions
    var profileExclusionGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_EXCLUSION);
    profileExclusionGr.addQuery('profile', sourceProfile);
    profileExclusionGr.query();
    while (profileExclusionGr.next()) {
        profileExclusionGr.setValue('profile', targetProfile);
        profileExclusionGr.insert();
    }
    // Copy Preservers
    var profilePreserverGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_PRESERVER);
    profilePreserverGr.addQuery('profile', sourceProfile);
    profilePreserverGr.query();
    while (profilePreserverGr.next()) {
        profilePreserverGr.setValue('profile', targetProfile);
        profilePreserverGr.insert();
    }
    // Copy Cleanup Scripts
    var profileCleanupScriptGr = new GlideRecord(CloneConstants.tableName.CLONE_PROFILE_CLEANUP_SCRIPT);
    profileCleanupScriptGr.addQuery('profile', sourceProfile);
    profileCleanupScriptGr.query();
    gs.getSession().putClientData('sn_clone_is_duplicate', 'true');
    while (profileCleanupScriptGr.next()) {
        profileCleanupScriptGr.setValue('profile', targetProfile);
        profileCleanupScriptGr.insert();
    }
    gs.getSession().putClientData('sn_clone_is_duplicate', '');

};
