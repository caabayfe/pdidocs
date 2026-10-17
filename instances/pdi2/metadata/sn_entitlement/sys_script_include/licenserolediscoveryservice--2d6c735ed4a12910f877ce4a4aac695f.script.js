var LicenseRoleDiscoveryService = Class.create();
LicenseRoleDiscoveryService.prototype = {
    initialize: function() {
        this.licenseRoleDiscoveredDao = new LicenseRoleDiscoveredDao();
        this.roleAnalyzerService = new RoleAnalyzerService();
        this._licenseRoleDiscoveryRunDao = new sn_entitlement.LicenseRoleDiscoveryRunDao();
    },

    /**
     * Analyze custom roles using role analyzer and insert/update information about role type in license_role_discovered 
     */
    analyzeCustomRoles: function() {
        const runId = this._licenseRoleDiscoveryRunDao.createCustomRun(new GlideDateTime(), null);

        this._processRoles(this.roleAnalyzerService.analyzeCustomRoles(), true);

        this._licenseRoleDiscoveryRunDao.setEndTimeStamp(runId, new GlideDateTime());
    },

    /**
     * Analyze customized out of the box roles using role analyzer and insert/update information about role type in license_role_discovered
     * 
     * @param {GlideDateTime} overrideTimestamp The timestamp to use if provided. If null/undefined, the last run-time will be used.
     */
    analyzeCustomizedOutOfTheBoxRoles: function(overrideTimestamp) {
        const filterTimestamp = overrideTimestamp ||
            this._licenseRoleDiscoveryRunDao.getStartTimestampByMostRecentOutOfBoxRun();
        const runId = this._licenseRoleDiscoveryRunDao.createOutOfBoxRun(new GlideDateTime(), filterTimestamp);

        this._processRoles(this.roleAnalyzerService.analyzeCustomizedOutOfTheBoxRoles(filterTimestamp), false);

        this._licenseRoleDiscoveryRunDao.setEndTimeStamp(runId, new GlideDateTime());
    },

    /**
     * Return role information for the roles which have been changed since last time applyRoleDataChanges was called
     * @return {Map} a map from roleName to an array containing two arrays [ [p1, p2...], [n1, n2, ...]]
     * where first array has previously synched LicenseRoleDiscoveredData objects,
     * and second array has new LicenseRoleDiscoveredData objects for those roles 
     * Note that either of these could be empty, but never both.
     */
    fetchChangedRoleData: function() {
        // first lookup un-synced records
        const changedRoleData = this.licenseRoleDiscoveredDao.lookupByStateOtherThan([this.licenseRoleDiscoveredDao.SYNCED]);

        // collect all unique roles names from them
        const roleNames = Array.from(new Set(changedRoleData.map(roleData => roleData.roleName.toLowerCase())));

        // lookup synced records for those roles to place as previous
        const existingRoleData = this.licenseRoleDiscoveredDao.lookupForRolesByState(roleNames, [this.licenseRoleDiscoveredDao.SYNCED]);

        const result = new Map(roleNames.map(name => [name, [
            [],
            []
        ]]));

        // collect all previous first
        existingRoleData.forEach(roleData => {
            const resultArrays = result.get(roleData.roleName.toLowerCase());
            resultArrays[0].push(roleData);
        });

        // collect changed info next
        changedRoleData.forEach(roleData => {
            const resultArrays = result.get(roleData.roleName.toLowerCase());
            // add New/Error but if deleted, keep this empty
            if (roleData.state === this.licenseRoleDiscoveredDao.NEW || roleData.state === this.licenseRoleDiscoveredDao.ERROR)
                resultArrays[1].push(roleData);
        });

        return result;
    },

    /**
     * Find changed role information for specified roleName since last time applyRoleDataChanges* was called and apply
     * the changes by changing state to sync or error or delete records as appropriate.
     * @param {string} roleName name of role to apply changes to
     * @param {boolean} uploadSuccess true indicates that information has been synced successfully and to mark as synced, false otherwise
     */
    applyRoleDataChanges: function(roleName, uploadSuccess) {
        const existingRoleData = this.licenseRoleDiscoveredDao.lookupForRole([roleName]);
        const previous = existingRoleData.filter(obj => obj.state === this.licenseRoleDiscoveredDao.SYNCED);
        const changed = existingRoleData.filter(obj => obj.state !== this.licenseRoleDiscoveredDao.SYNCED && obj.state != this.licenseRoleDiscoveredDao.DELETED);

        // case 0: success=false, mark changed as error
        // case 1: if previous is empty, mark all changed as Synced
        // case 2: if previous is not empty, changed is empty, delete all previous, and delete the DELETED record
        // case 3: if previous is not empty, changed is not empty, delete previous, and mark all changed as Synched
        if (!uploadSuccess)
            this._markError(roleName, changed);
        else if (previous.length === 0)
            this._markSynced(roleName, changed);
        else if (changed.length === 0) {
            const deleted = existingRoleData.filter(obj => obj.state == this.licenseRoleDiscoveredDao.DELETED);
            const previousWithDeleted = [...previous, ...deleted];
            this._deleteRoleData(roleName, previousWithDeleted, 'removed role')
        } else {
            this._deleteRoleData(roleName, previous, 'changed');
            this._markSynced(roleName, changed);
        }
    },

    /**
     * Find changed role information since last time applyRoleDataChanges* was called and apply
     * the changes by changing state to error
     */
    applyRoleDataChangesAsError: function() {
        const changedRoleData = this.fetchChangedRoleData();
        const ids = [...changedRoleData]
            .map(value => value[1][1])
            .flat()
            .filter(roleData => roleData.state != this.licenseRoleDiscoveredDao.DELETED)
            .map(roleData => roleData.id);
        gs.info(`Marking ${ids.length} records as error`);
        this.licenseRoleDiscoveredDao.markState(ids, this.licenseRoleDiscoveredDao.ERROR);
    },

    _processRoles: function(analysisResult, isCustom) {
        for (const [roleName, appDetail] of Object.entries(analysisResult.app_detail))
            this._processRole(roleName, appDetail, isCustom);
        for (const roleName of this._findRolesInTableOtherThan(Object.keys(analysisResult.app_detail)))
            this._processRole(roleName, {}, isCustom);
    },

    _processRole: function(roleName, appDetail, isCustom) {
        const existingRoleData = this.licenseRoleDiscoveredDao.lookupForRole([roleName]);
        existingRoleData.sort(this._compareRoleData.bind(this));

        const existingSynced = existingRoleData.filter(obj => obj.state === this.licenseRoleDiscoveredDao.SYNCED);
        const existingNonSynced = existingRoleData.filter(obj => obj.state !== this.licenseRoleDiscoveredDao.SYNCED);

        const newRoleData = this._buildRoleData(roleName, appDetail, isCustom);
        newRoleData.sort(this._compareRoleData.bind(this));

        // Custom Logic:
        // case 0: newRoleData is empty -- remove existingNonSynced and add record with deleted state if there are synced records
        // case 1: existingSynced matches newRoleData --- remove existingNonSynced  (COMMON CASE)
        // case 2: existingSynced does not match newRoleData 
        //         case 21: if existingNonSynced matches newRoleData --- do nothing (this can be New records or Error records)
        //         case 22: if existingNonSynced does not match newRoleData, remove existingNonSynced, create newRoleData

        // OOB Logic:
        // Since OOB roles aren't processed every run, just based on detected changes since the last run, it is not desired
        // to delete records as they are with custom roles. The only valid scenario is "case 2" where there is also
        // newRoleData present indicating there were additional changes to the OOB role. In which case we want to replace
        // the existing data with new data.

        if (isCustom && newRoleData.length === 0) {
            this._deleteRoleData(roleName, existingNonSynced, 'non-synced', isCustom);
            if (existingSynced.length > 0)
                this._addDeletedRecord(roleName, isCustom);
        } else if (isCustom && this._roleDataArraysEquivalent(existingSynced, newRoleData)) {
            this._deleteRoleData(roleName, existingNonSynced, 'non-synced', isCustom);
        } else if ((isCustom || newRoleData.length > 0) && !this._roleDataArraysEquivalent(existingNonSynced, newRoleData)) {
            this._deleteRoleData(roleName, existingNonSynced, 'non-synced', isCustom);
            this._addRoleData(roleName, newRoleData, isCustom);
        }
    },

    _findRolesInTableOtherThan: function(roleNames) {
        return this.licenseRoleDiscoveredDao.lookupRolesOtherThan(roleNames);
    },

    /**
     * Look at per role output of role analyzer return an array of LicenseRoleDiscoveredData which can be inserted
     * into the license_role_discovered table
     */
    _buildRoleData: function(roleName, appDetail, isCustom) {
        return Object.values(appDetail)
            .filter(roleInApplication => !isCustom || roleInApplication.appId !== 'platform')
            .map(roleInApplication => this._toLicenseRoleDiscoveredData(roleName, roleInApplication, isCustom));
    },

    /**
     * Delete records for specified roleName
     * @param {string} roleName name of role to which role data applies
     * @param {array} roleData array of LicenseRoleDiscoveredData where id is taken as the sys_id of the record
     * @param {string} description adjective to apply to deleted records in log
     * @param {bool} isCustom provides a deletion filter for the role type. If true, it only deletes custom, if false only OOB, if null all
     */
    _deleteRoleData: function(roleName, roleData, description, isCustom = null) {
        const ids = roleData.map(obj => obj.id);
        if (ids.length == 0)
            return;
        gs.info(`Deleting ${ids.length} ${description} records for role ${roleName}`);

        if (isCustom == null)
            this.licenseRoleDiscoveredDao.deleteRecords(ids);
        else
            this.licenseRoleDiscoveredDao.deleteRecordsByCategory(ids, isCustom);
    },

    /**
     * Add a record in license_role_discovered where state=deleted for specified roleName
     * @param {string} roleName 
     */
    _addDeletedRecord: function(roleName, isCustom) {
        const roleData = new LicenseRoleDiscoveredData(
            null,
            roleName,
            'requestor',
            isCustom,
            this.licenseRoleDiscoveredDao.DELETED,
            'deleted',
            'unknown',
            'global'
        );
        gs.info(`Adding deleted record for role ${roleName}`);
        this.licenseRoleDiscoveredDao.insertOrUpdate(roleData);
    },

    /**
     * Add records for specified roleName
     * @param {string} roleName name of role to which role data applies
     * @param {array} newRoleData array of LicenseRoleDiscoveredData objects
     */
    _addRoleData: function(roleName, newRoleData) {
        gs.info(`Adding ${newRoleData.length} records for role ${roleName}`);
        newRoleData.forEach(roleData => this.licenseRoleDiscoveredDao.insertOrUpdate(roleData));
    },

    /**
     * Mark records for specified roleName as state=Synced in license_role_discovered
     * @param {string} roleName name of the role
     * @param {array} changedRoleData array of LicenseRoleDiscoveredData objects where id is taken as the sys_id of the record
     */
    _markSynced: function(roleName, changedRoleData) {
        const ids = changedRoleData.map(roleData => roleData.id);
        gs.info(`Marking ${ids.length} records as synced for role ${roleName}`);
        this.licenseRoleDiscoveredDao.markState(ids, this.licenseRoleDiscoveredDao.SYNCED);
    },

    /**
     * Mark records for specified roleName as state=Error in license_role_discovered
     * @param {string} roleName name of the role
     * @param {array} changedRoleData array of LicenseRoleDiscoveredData objects where id is taken as the sys_id of the record
     */
    _markError: function(roleName, changedRoleData) {
        const ids = changedRoleData.map(roleData => roleData.id);
        gs.info(`Marking ${ids.length} records as for role ${roleName}`);
        this.licenseRoleDiscoveredDao.markState(ids, this.licenseRoleDiscoveredDao.ERROR);
    },

    _toLicenseRoleDiscoveredData: function(roleName, roleInApplication, isCustom) {
        const appId = this._inferAppId(roleInApplication);

        const state = this.licenseRoleDiscoveredDao.NEW;

        return new LicenseRoleDiscoveredData(
            null,
            roleName,
            roleInApplication.detectedType.roleType,
            isCustom,
            state,
            roleInApplication.detectedType.code,
            appId,
            roleInApplication.scope
        );
    },

    _inferAppId: function(roleInApplication) {
        const source = roleInApplication.source.primary;
        // if appId is
        //  a. special fallthrough value 'unk' (for global applications which can't be guessed to be platform)
        //  b. special fallthrough value 'global' with source='App Family' (for global tables where package is empty)
        //  c. or source is a scoped app
        //  d. or source = 'Custom Unknown' (for custom tables where the custom table access app family can't be found)
        // take (licensable) application as unknown
        if (roleInApplication.appId === 'unk' || source.toLowerCase() === 'scope' || source === 'Custom Unknown' ||
            (roleInApplication.appId === 'global' && source.toLowerCase() === 'app family'))
            return 'unknown';
        return roleInApplication.appId;
    },

    /**
     * Return numeric value which indicates lexicographical ordering between input LicenseRoleDiscoveredData objects
     * Comparison is based on (roleType, application, scope)
     * @param {object} lhs 
     * @param {object} rhs 
     * @returns {integer} -1 if lhs<rhs, 1 if lhs>rhs, 0 otherwise
     */
    _compareRoleData: function(lhs, rhs) {
        // simple lexigraphical ordering based on (roleType, application, scope)
        let diff = this._compare(lhs.roleType, rhs.roleType);
        if (diff != 0)
            return diff;
        diff = this._compare(lhs.application, rhs.application);
        if (diff != 0)
            return diff;
        return this._compare(lhs.scope, rhs.scope);
    },

    /**
     * Return numeric value which indicates lexicographical ordering between string arguments
     */
    _compare: function(lhs, rhs) {
        if (lhs < rhs)
            return -1;
        if (lhs > rhs)
            return 1;
        return 0;
    },
    /**
     * Compare two sorted arrays of LicenseRoleDiscoveredData to see if they hold equivalent data as determined by this._compareRoleData
     * @param {array} lhs sorted array of LicenseRoleDiscoveredData 
     * @param {array} rhs sorted array of LicenseRoleDiscoveredData
     * @return {boolean} 
     */
    _roleDataArraysEquivalent: function(lhs, rhs) {
        if (lhs.length != rhs.length)
            return false;

        for (let i = 0; i < lhs.length; ++i) {
            if (this._compareRoleData(lhs[i], rhs[i]) != 0)
                return false;
        }
        return true;
    },

    type: 'LicenseRoleDiscoveryService'
};
