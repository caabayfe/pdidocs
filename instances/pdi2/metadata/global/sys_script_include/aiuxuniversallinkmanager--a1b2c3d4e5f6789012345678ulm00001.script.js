var AiuxUniversalLinkManager = Class.create();
AiuxUniversalLinkManager.prototype = {
    initialize: function() {
        this.PATH_SEGMENT_TABLE = 'sys_sg_universal_link_path_segment';
        this.SUPPORTED_URL_TABLE = 'sys_sg_universal_link_supported_url';
        this.MOBILE_APP_TABLE = 'sys_sg_mobile_application';
        this.EXPERIENCE_TABLE = 'sys_aix_experience';
        this.AIUX_PATH_SEGMENT_PREFIX = 'AIUX - ';
        this.AIUX_MOBILE_APPLET_BUILDER_SCRIPT = "(function initializeMobileScreenBuilder(urlPath, urlQuery, originalUrl) { var mobileScreenBuilder = new sn_mobile.ScriptableMobileScreenBuilder(); return mobileScreenBuilder; })(urlPath, urlQuery, originalUrl);";
    },

    /**
     * Creates or updates universal link entries for an AIUX native client.
     * - One path segment per URL suffix (not per native client)
     * - One supported URL per mobile app type (not per native client)
     *
     * @param {GlideRecord} nativeClientGR - The sys_sg_native_client GlideRecord
     * @return {Object} { success: boolean, pathSegmentId: string, supportedUrlId: string, error: string }
     */
    createUniversalLinkEntries: function(nativeClientGR) {
        if (!nativeClientGR) {
            return this._error('nativeClientGR is required');
        }

        var experienceId = nativeClientGR.getValue('aiux_web_experience');
        if (JSUtil.nil(experienceId)) {
            return this._error('aiux_web_experience is not set on native client');
        }

        var nativeClientType = nativeClientGR.getValue('type');
        if (JSUtil.nil(nativeClientType)) {
            return this._error('type is not set on native client');
        }

        var nativeClientOrder = this._parseOrder(nativeClientGR.getValue('order'));

        var urlSuffix = this._getExperienceUrlSuffix(experienceId);
        if (!urlSuffix) {
            return this._error('Could not retrieve URL suffix from experience: ' + experienceId);
        }

        // Find mobile app by type (must exist)
        var mobileAppId = this._findMobileApplication(nativeClientType);
        if (!mobileAppId) {
            return this._error('Could not find mobile application for type: ' + nativeClientType);
        }

        // One path segment per URL suffix
        var pathSegmentId = this._createOrUpdatePathSegmentByUrlSuffix(urlSuffix);
        if (!pathSegmentId) {
            return this._error('Failed to create path segment for URL suffix: ' + urlSuffix);
        }

        // One supported URL per (mobile app type + URL suffix) combination
        var supportedUrlId = this._createOrUpdateSupportedUrl(mobileAppId, pathSegmentId, nativeClientType, urlSuffix, nativeClientOrder);
        if (!supportedUrlId) {
            return this._error('Failed to create supported URL entry for type: ' + nativeClientType + ', suffix: ' + urlSuffix);
        }

        return {
            success: true,
            pathSegmentId: pathSegmentId,
            supportedUrlId: supportedUrlId
        };
    },

    /**
     * Gets the URL suffix from sys_aix_experience table.
     *
     * @param {string} experienceId - sys_id of the experience record
     * @return {string|null} URL suffix or null if not found
     */
    _getExperienceUrlSuffix: function(experienceId) {
        var experienceGR = new GlideRecord(this.EXPERIENCE_TABLE);
        if (!experienceGR.get(experienceId)) {
            gs.warn('AiuxUniversalLinkManager: Experience not found: ' + experienceId);
            return null;
        }
        return experienceGR.getValue('url_suffix');
    },

    /**
     * Finds an existing mobile application by type.
     * Mobile applications should already exist - we don't create them.
     *
     * @param {string} nativeClientType - The type field from native client
     * @return {string|null} sys_id of the mobile application or null
     */
    _findMobileApplication: function(nativeClientType) {
        var mobileAppGR = new GlideRecord(this.MOBILE_APP_TABLE);
        mobileAppGR.addQuery('client_type_header', nativeClientType);
        mobileAppGR.setLimit(1);
        mobileAppGR.query();

        if (mobileAppGR.next()) {
            return mobileAppGR.getUniqueValue();
        }

        gs.warn('AiuxUniversalLinkManager: No mobile application found for type: ' + nativeClientType);
        return null;
    },

    /**
     * Creates or updates a path segment entry by URL suffix.
     * One path segment per URL suffix (shared across all native clients with same experience).
     * Regex pattern: ^aiux\/<urlSuffix>(\/.*)?$
     *
     * @param {string} urlSuffix - URL suffix from the experience
     * @return {string|null} sys_id of the path segment or null
     */
    _createOrUpdatePathSegmentByUrlSuffix: function(urlSuffix) {
        var pathSegmentName = this.AIUX_PATH_SEGMENT_PREFIX + urlSuffix;
        var regex = '^aiux\\/' + this._escapeRegex(urlSuffix) + '(\\/.*)?$';

        // Check for existing entry by URL suffix name
        var pathSegmentGR = new GlideRecord(this.PATH_SEGMENT_TABLE);
        pathSegmentGR.addQuery('name', pathSegmentName);
        pathSegmentGR.setLimit(1);
        pathSegmentGR.query();

        if (pathSegmentGR.next()) {
            // Entry exists - update regex if needed
            if (pathSegmentGR.getValue('path_segment_regex') !== regex) {
                pathSegmentGR.setValue('path_segment_regex', regex);
                if (!pathSegmentGR.update()) {
                    gs.error('AiuxUniversalLinkManager: Failed to update path segment: ' + pathSegmentName);
                    return null;
                }
                gs.info('AiuxUniversalLinkManager: Updated path segment regex for: ' + pathSegmentName);
            }
            return pathSegmentGR.getUniqueValue();
        }

        // Also check by regex pattern (in case name was different)
        var pathSegmentByRegex = new GlideRecord(this.PATH_SEGMENT_TABLE);
        pathSegmentByRegex.addQuery('path_segment_regex', regex);
        pathSegmentByRegex.setLimit(1);
        pathSegmentByRegex.query();

        if (pathSegmentByRegex.next()) {
            return pathSegmentByRegex.getUniqueValue();
        }

        // No existing entry found - create new one
        var newPathSegment = new GlideRecord(this.PATH_SEGMENT_TABLE);
        newPathSegment.initialize();
        newPathSegment.setValue('name', pathSegmentName);
        newPathSegment.setValue('path_segment_regex', regex);

        var sysId = newPathSegment.insert();
        if (!sysId) {
            gs.error('AiuxUniversalLinkManager: Failed to create path segment: ' + pathSegmentName);
            return null;
        }

        gs.info('AiuxUniversalLinkManager: Created path segment: ' + sysId + ' with regex: ' + regex);
        return sysId;
    },

    /**
     * Creates or updates a supported URL entry by (mobile app type + URL suffix) combination.
     * This allows same mobile app type to have different experiences (e.g., based on roles).
     *
     * @param {string} mobileAppId - sys_id of the mobile application
     * @param {string} pathSegmentId - sys_id of the path segment
     * @param {string} nativeClientType - The type field from native client
     * @param {string} urlSuffix - URL suffix from the experience
     * @param {number} order - Order value from native client
     * @return {string|null} sys_id of the supported URL or null
     */
    _createOrUpdateSupportedUrl: function(mobileAppId, pathSegmentId, nativeClientType, urlSuffix, order) {
        // Name format: "AIUX - <type> - <urlSuffix>" e.g., "AIUX - agent - employeeworks"
        var supportedUrlName = this.AIUX_PATH_SEGMENT_PREFIX + nativeClientType + ' - ' + urlSuffix;

        // Check for existing entry by name (unique per type + suffix combination)
        var supportedUrlGR = new GlideRecord(this.SUPPORTED_URL_TABLE);
        supportedUrlGR.addQuery('name', supportedUrlName);
        supportedUrlGR.setLimit(1);
        supportedUrlGR.query();

        if (supportedUrlGR.next()) {
            // Entry exists - update path segment and order if needed
            var needsUpdate = false;
            if (supportedUrlGR.getValue('path_segment') !== pathSegmentId) {
                supportedUrlGR.setValue('path_segment', pathSegmentId);
                needsUpdate = true;
            }
            if (supportedUrlGR.getValue('mobile_application') !== mobileAppId) {
                supportedUrlGR.setValue('mobile_application', mobileAppId);
                needsUpdate = true;
            }
            // Calculate minimum order across all NCs with same (type + experience)
            var minOrder = this._getMinOrderForTypeAndSuffix(nativeClientType, urlSuffix);
            var existingOrder = this._parseOrder(supportedUrlGR.getValue('order'));
            if (minOrder !== existingOrder) {
                supportedUrlGR.setValue('order', minOrder);
                needsUpdate = true;
            }
            if (needsUpdate) {
                if (!supportedUrlGR.update()) {
                    gs.error('AiuxUniversalLinkManager: Failed to update supported URL: ' + supportedUrlName);
                    return null;
                }
                gs.info('AiuxUniversalLinkManager: Updated supported URL: ' + supportedUrlName);
            }
            return supportedUrlGR.getUniqueValue();
        }

        // No existing entry found - create new one
        var newSupportedUrl = new GlideRecord(this.SUPPORTED_URL_TABLE);
        newSupportedUrl.initialize();
        newSupportedUrl.setValue('name', supportedUrlName);
        newSupportedUrl.setValue('path_segment', pathSegmentId);
        newSupportedUrl.setValue('mobile_application', mobileAppId);
        newSupportedUrl.setValue('active', true);
        newSupportedUrl.setValue('order', order);
        newSupportedUrl.setValue('mobile_applet_builder', this.AIUX_MOBILE_APPLET_BUILDER_SCRIPT);

        var sysId = newSupportedUrl.insert();
        if (!sysId) {
            gs.error('AiuxUniversalLinkManager: Failed to create supported URL: ' + supportedUrlName);
            return null;
        }

        gs.info('AiuxUniversalLinkManager: Created supported URL: ' + sysId + ' (' + supportedUrlName + ') with order: ' + order);
        return sysId;
    },

    /**
     * Cleans up orphaned supported URL and path segment entries when type or experience changes.
     * Called when a native client's type or experience is updated.
     *
     * @param {string} oldType - Previous type value
     * @param {string} oldExperienceId - Previous experience sys_id
     */
    cleanupOrphanedEntries: function(oldType, oldExperienceId) {
        if (JSUtil.nil(oldType) || JSUtil.nil(oldExperienceId)) {
            return;
        }

        var oldUrlSuffix = this._getExperienceUrlSuffix(oldExperienceId);
        if (!oldUrlSuffix) {
            return;
        }

        var oldSupportedUrlName = this.AIUX_PATH_SEGMENT_PREFIX + oldType + ' - ' + oldUrlSuffix;

        // Check if any other native client still uses this (type + suffix) combination
        if (!this._isTypeAndSuffixInUse(oldType, oldUrlSuffix)) {
            this._deleteSupportedUrl(oldSupportedUrlName);
        } else {
            // Other NCs still use this combo - recalculate minimum order
            this._updateSupportedUrlOrder(oldSupportedUrlName, oldType, oldUrlSuffix);
        }

        // Check if any supported URL still references this path segment
        // Try both naming formats: "AIUX - <suffix>" (new) and "<suffix>" (old)
        var oldPathSegmentName = this.AIUX_PATH_SEGMENT_PREFIX + oldUrlSuffix;
        var oldPathSegmentNameLegacy = oldUrlSuffix;
        
        if (!this._isPathSegmentInUse(oldPathSegmentName)) {
            this._deletePathSegment(oldPathSegmentName);
        }
        if (!this._isPathSegmentInUseBySuffix(oldUrlSuffix)) {
            this._deletePathSegment(oldPathSegmentNameLegacy);
        }
    },

    /**
     * Checks if any native client still uses the given URL suffix.
     *
     * @param {string} urlSuffix - URL suffix
     * @return {boolean} true if still in use
     */
    _isPathSegmentInUseBySuffix: function(urlSuffix) {
        var nativeClientGR = new GlideRecord('sys_sg_native_client');
        nativeClientGR.addNotNullQuery('aiux_web_experience');
        nativeClientGR.query();

        while (nativeClientGR.next()) {
            var expSuffix = this._getExperienceUrlSuffix(nativeClientGR.getValue('aiux_web_experience'));
            if (expSuffix === urlSuffix) {
                return true;
            }
        }
        return false;
    },

    /**
     * Gets the minimum order value across all native clients with the given (type + URL suffix) combination.
     *
     * @param {string} type - Native client type
     * @param {string} urlSuffix - URL suffix
     * @return {number} Minimum order value, defaults to 9999 if none found
     */
    _getMinOrderForTypeAndSuffix: function(type, urlSuffix) {
        var minOrder = 9999;
        this._forEachNativeClientByTypeAndSuffix(type, urlSuffix, function(nativeClientGR) {
            var ncOrder = this._parseOrder(nativeClientGR.getValue('order'));
            if (ncOrder < minOrder) {
                minOrder = ncOrder;
            }
        }.bind(this));
        return minOrder;
    },

    /**
     * Checks if any native client still uses the given (type + URL suffix) combination.
     *
     * @param {string} type - Native client type
     * @param {string} urlSuffix - URL suffix
     * @return {boolean} true if still in use
     */
    _isTypeAndSuffixInUse: function(type, urlSuffix) {
        var found = false;
        this._forEachNativeClientByTypeAndSuffix(type, urlSuffix, function() {
            found = true;
            return true; // Break early - only need to find one
        });
        return found;
    },

    /**
     * Checks if any supported URL still references the given path segment.
     *
     * @param {string} pathSegmentName - Name of the path segment
     * @return {boolean} true if still in use
     */
    _isPathSegmentInUse: function(pathSegmentName) {
        var pathSegmentGR = new GlideRecord(this.PATH_SEGMENT_TABLE);
        pathSegmentGR.addQuery('name', pathSegmentName);
        pathSegmentGR.setLimit(1);
        pathSegmentGR.query();

        if (!pathSegmentGR.next()) {
            return false;
        }

        var supportedUrlGR = new GlideRecord(this.SUPPORTED_URL_TABLE);
        supportedUrlGR.addQuery('path_segment', pathSegmentGR.getUniqueValue());
        supportedUrlGR.addQuery('name', 'STARTSWITH', this.AIUX_PATH_SEGMENT_PREFIX);
        supportedUrlGR.setLimit(1);
        supportedUrlGR.query();

        return supportedUrlGR.hasNext();
    },

    /**
     * Deletes a supported URL entry by name.
     *
     * @param {string} name - Name of the supported URL to delete
     */
    _deleteSupportedUrl: function(name) {
        var supportedUrlGR = new GlideRecord(this.SUPPORTED_URL_TABLE);
        supportedUrlGR.addQuery('name', name);
        supportedUrlGR.query();

        while (supportedUrlGR.next()) {
            var sysId = supportedUrlGR.getUniqueValue();
            if (supportedUrlGR.deleteRecord()) {
                gs.info('AiuxUniversalLinkManager: Deleted orphaned supported URL: ' + name + ' (' + sysId + ')');
            } else {
                gs.error('AiuxUniversalLinkManager: Failed to delete supported URL: ' + name);
            }
        }
    },

    /**
     * Updates the order of a supported URL entry to the minimum order across all NCs with same (type + suffix).
     *
     * @param {string} supportedUrlName - Name of the supported URL
     * @param {string} type - Native client type
     * @param {string} urlSuffix - URL suffix
     */
    _updateSupportedUrlOrder: function(supportedUrlName, type, urlSuffix) {
        var supportedUrlGR = new GlideRecord(this.SUPPORTED_URL_TABLE);
        supportedUrlGR.addQuery('name', supportedUrlName);
        supportedUrlGR.setLimit(1);
        supportedUrlGR.query();

        if (supportedUrlGR.next()) {
            var minOrder = this._getMinOrderForTypeAndSuffix(type, urlSuffix);
            var existingOrder = this._parseOrder(supportedUrlGR.getValue('order'));
            
            if (minOrder !== existingOrder) {
                supportedUrlGR.setValue('order', minOrder);
                if (supportedUrlGR.update()) {
                    gs.info('AiuxUniversalLinkManager: Updated supported URL order to ' + minOrder + ' for: ' + supportedUrlName);
                } else {
                    gs.error('AiuxUniversalLinkManager: Failed to update order for supported URL: ' + supportedUrlName);
                }
            }
        }
    },

    /**
     * Deletes a path segment entry by name.
     *
     * @param {string} name - Name of the path segment to delete
     */
    _deletePathSegment: function(name) {
        var pathSegmentGR = new GlideRecord(this.PATH_SEGMENT_TABLE);
        pathSegmentGR.addQuery('name', name);
        pathSegmentGR.query();

        while (pathSegmentGR.next()) {
            var sysId = pathSegmentGR.getUniqueValue();
            if (pathSegmentGR.deleteRecord()) {
                gs.info('AiuxUniversalLinkManager: Deleted orphaned path segment: ' + name + ' (' + sysId + ')');
            } else {
                gs.error('AiuxUniversalLinkManager: Failed to delete path segment: ' + name);
            }
        }
    },

    /**
     * Escapes special regex characters in a string.
     *
     * @param {string} str - String to escape
     * @return {string} Escaped string
     */
    _escapeRegex: function(str) {
        if (!str) return '';
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },

    _error: function(message) {
        gs.error('AiuxUniversalLinkManager: ' + message);
        return { success: false, error: message };
    },

    /**
     * Parses order value, treating not set (NaN/empty) as highest priority (-1).
     *
     * @param {string} orderValue - The order value to parse
     * @return {number} Parsed order value, or -1 if not set
     */
    _parseOrder: function(orderValue) {
        var order = parseInt(orderValue);
        if (isNaN(order)) {
            return -1;
        }
        return order;
    },

    /**
     * Iterates over native clients matching the given type and URL suffix.
     * Callback can return true to break out of the loop early.
     *
     * @param {string} type - Native client type
     * @param {string} urlSuffix - URL suffix to match
     * @param {function} callback - Function to call for each matching native client. Return true to stop iteration.
     */
    _forEachNativeClientByTypeAndSuffix: function(type, urlSuffix, callback) {
        var nativeClientGR = new GlideRecord('sys_sg_native_client');
        nativeClientGR.addQuery('type', type);
        nativeClientGR.addNotNullQuery('aiux_web_experience');
        nativeClientGR.query();

        while (nativeClientGR.next()) {
            var expSuffix = this._getExperienceUrlSuffix(nativeClientGR.getValue('aiux_web_experience'));
            if (expSuffix === urlSuffix) {
                if (callback(nativeClientGR) === true) {
                    break;
                }
            }
        }
    },

    type: 'AiuxUniversalLinkManager'
};
