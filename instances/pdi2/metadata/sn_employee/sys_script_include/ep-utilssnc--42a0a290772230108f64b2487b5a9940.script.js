var ep_UtilsSNC = Class.create();
ep_UtilsSNC.prototype = {
    initialize: function() {
        this.currentDomainId = gs.getSession().getCurrentDomainID() || 'global';
        this.DOMAIN_PLUGIN_ID = "com.glide.domain.msp_extensions";
        this.isDomainSeparationActive = GlidePluginManager.isActive(this.DOMAIN_PLUGIN_ID);
        this.notAvailableForCriterias = {};
        this.availableForCriterias = {};
        this.isWidgetCriteriaPopulated = false;
        this.NOT_AVAILABLE_M2M_TABLE = "sn_employee_widget_mapping_user_criteria_no_mtom";
        this.AVAILABLE_M2M_TABLE = "sn_employee_widget_mapping_user_criteria_mtom";
        this.SEC_MANAGER_RELATIONSHIP_TABLE = "sn_employee_secondary_manager_relationship";
        this.appVersionValid = parseInt(gs.getProperty("sn_employee.app_version")) >= 202402; // Make sure app version is higher than Feb 2024
        this.portalConfigGR = null;
        this.tabsinPortalConfig = null;
    },

    /**
     * Returns true if user is a subordinate of manager
     * @param {String} userId - sys_id of sys_user record
     * @param {String} managerId - sys_id of direct manager of current user
     * @param {Array} managers - List of sys_ids of managers of current user (Collected during the recursive calls)
     * returns {Boolean}
     */
    userReportsTo: function(userId, managerId, managers) {
        var user = new GlideRecord('sys_user');
        if (!user.get(userId) || !user.canRead() || user.manager == '')
            return false;

        if (!managers)
            managers = '';
        if (managers.indexOf(userId) > -1)
            return false;

        if (user.manager == managerId)
            return true;
        else
            return this.userReportsTo(user.manager.sys_id, managerId, managers + ',' + userId);
    },

    /**
     * Returns the sys_id of Employee Profile record 
     * @param {String} userId - sys_id of sys_user record
     * returns {String} 
     */
    getEmployeeProfileSysId: function(userId) {
        var profileRecord = this.getEmployeeProfileRecord(userId);
        if (profileRecord != null)
            return profileRecord.sys_id;
        return null;
    },

    /**
     * Returns the Employee Profile record of sys_user with userId as sys_id 
     * @param {String} userId - sys_id of sys_user record
     * returns {GlideRecord} 
     */
    getEmployeeProfileRecord: function(userId) {
        userId = userId || gs.getUserID();
        var profileGr = new GlideRecord('sn_employee_profile');
        profileGr.addQuery('user', userId);
        profileGr.setLimit(1);
        profileGr.query();
        if (profileGr.next())
            return profileGr;
        return null;
    },

    /**
     * Returns the User record with userId as sys_id
     * @param {String} userId - sys_id of sys_user record
     * returns {GlideRecord}
     */
    getSysUserRecord: function(userId) {
        userId = userId || gs.getUserID();
        var sysUserGR = new GlideRecord('sys_user');
        if (sysUserGR.get(userId))
            return sysUserGR;
        return null;
    },

    /**
     * Returns the HR Profile record with userId as sys_id
     * @param {String} userId - sys_id of sys_user record
     * returns {GlideRecord}
     */
    getHRProfileRecord: function(userId) {
        var isHrCoreActive = GlidePluginManager.isActive('com.sn_hr_core');
        if (!isHrCoreActive) {
            return null;
        }
        var profileGr = new GlideRecord('sn_hr_core_profile');
        profileGr.addQuery('user', userId);
        profileGr.setLimit(1);
        profileGr.query();
        if (profileGr.next())
            return profileGr;
        return null;
    },

    createEmployeeProfileFromUser: function(userId, skipBr) {
        var employeeProfileGr = new GlideRecord("sn_employee_profile");
        employeeProfileGr.initialize();
        employeeProfileGr.setValue("user", userId);
        var hrProfileGr = this.getHRProfileRecord(userId);
        if (hrProfileGr) {
            var fieldsToSync = ep_Constants.HR_FIELDS;
            employeeProfileGr.setValue("hr_profile", hrProfileGr.getUniqueValue());
            fieldsToSync.forEach(function(field) {
                employeeProfileGr.setValue(field, hrProfileGr.getValue(field));
            });
        }
        if (skipBr)
            employeeProfileGr.setWorkflow(false);
        employeeProfileGr.insert();
        return employeeProfileGr.getUniqueValue();
    },

    getEmployeeProfileByUseId: function(userId) {
        var employeeProfileGr = new GlideRecord("sn_employee_profile");
        if (!gs.nil(userId)) {
            employeeProfileGr.addQuery("user", userId);
            employeeProfileGr.setLimit(1);
            employeeProfileGr.query();
            if (employeeProfileGr.next()) {
                return employeeProfileGr;
            }
        }
    },

    updateEmployeeProfileRecord: function(employeeProfileGr, hrProfileGr, userId) {
        var fieldsToSync = ep_Constants.HR_FIELDS;
        employeeProfileGr.user = userId;
        employeeProfileGr.hr_profile = hrProfileGr.getUniqueValue();
        fieldsToSync.forEach(function(field) {
            employeeProfileGr.setValue(field, hrProfileGr.getValue(field));
        });
    },

    createEmployeeProfileFromHRProfile: function(hrProfileGr, skipBr) {
        var userId = hrProfileGr.getValue("user") || '';
        var employeeProfileGr = this.getEmployeeProfileByUseId(userId);
        if (employeeProfileGr) {
            this.updateEmployeeProfileRecord(employeeProfileGr, hrProfileGr, userId);
            if (skipBr)
                employeeProfileGr.setWorkflow(false);
            employeeProfileGr.update();
        } else {
            employeeProfileGr = new GlideRecord("sn_employee_profile");
            employeeProfileGr.initialize();
            this.updateEmployeeProfileRecord(employeeProfileGr, hrProfileGr, userId);
            if (skipBr)
                employeeProfileGr.setWorkflow(false);
            employeeProfileGr.insert();
        }

        return employeeProfileGr.getUniqueValue();
    },

    /* ACLs for professional profile related tables starts */
    canCreateProfesionalRelatedRecs: function(current, role) {
        role = gs.nil(role) ? "sn_employee.admin" : role;
        if (gs.hasRole(role))
            return true;

        if (GlidePluginManager.isActive('com.sn_professional'))
            return false;

        var employeeProfileGr = new GlideRecord('sn_employee_profile');
        employeeProfileGr.addQuery('user', gs.getUserID());
        employeeProfileGr.query();
        if (employeeProfileGr.hasNext())
            answer = employeeProfileGr.canWrite();
    },

    canReadProfesionalRelatedRecs: function(current, role) {
        if (current.isNewRecord())
            return true;
        return this.canUpdateProfesionalRelatedRecs(current, role);
    },

    canUpdateProfesionalRelatedRecs: function(current, role) {
        role = gs.nil(role) ? "sn_employee.admin" : role;
        if (gs.hasRole(role))
            return true;

        if (GlidePluginManager.isActive('com.sn_professional') && !gs.nil(current.professional_profile))
            return false;

        if (current.employee_profile && current.employee_profile.user.toString() === gs.getUserID()) {
            return true;
        }

        return false;
    },
    /* ACLs for professional profile related tables ends */

    getCurrentDefinition: function() {
        var employeeDefinitionGr = new GlideRecord('sn_employee_definition');
        employeeDefinitionGr.addActiveQuery();
        employeeDefinitionGr.orderByDesc('sys_updated_on');
        employeeDefinitionGr.setLimit(1);
        employeeDefinitionGr.query();
        if (employeeDefinitionGr.next())
            return employeeDefinitionGr;
        return null;
    },

	getCurrentDefinitionByTable: function(profileTable) {
        var employeeDefinitionGr = new GlideRecord('sn_employee_definition');
        employeeDefinitionGr.addActiveQuery();
        employeeDefinitionGr.orderByDesc('sys_updated_on');
        employeeDefinitionGr.addQuery('table',profileTable);
        employeeDefinitionGr.setLimit(1);
        employeeDefinitionGr.query();
        if (employeeDefinitionGr.next())
            return employeeDefinitionGr;
        return null;
    },


    getCurrentDefinitionInDomain: function(domainId) {
        var employeeDefinitionGr = new GlideRecord('sn_employee_definition');
        employeeDefinitionGr.addActiveQuery();
        employeeDefinitionGr.addQuery("sys_domain", domainId);
        employeeDefinitionGr.orderByDesc('sys_updated_on');
        employeeDefinitionGr.setLimit(1);
        employeeDefinitionGr.query();
        if (employeeDefinitionGr.next())
            return employeeDefinitionGr;
        return null;
    },

    getCurrentDefinitionInDomainByTable: function(domainId,profileTable) {
        var employeeDefinitionGr = new GlideRecord('sn_employee_definition');
        employeeDefinitionGr.addActiveQuery();
        employeeDefinitionGr.addQuery("sys_domain", domainId);
        employeeDefinitionGr.addQuery('table',profileTable);
        employeeDefinitionGr.orderByDesc('sys_updated_on');
        employeeDefinitionGr.setLimit(1);
        employeeDefinitionGr.query();
        if (employeeDefinitionGr.next())
            return employeeDefinitionGr;
        return null;
    },

    /**
     * Returns the value of sys_property {sn_employee.employee_profile_enabled}
     * returns true/false
     */
    isEmployeeProfileEnabled: function() {
        return GlideApplicationProperty.getValue('sn_employee.employee_profile_enabled') == 'true' ? true : false;
    },

    /**
     * Follows the main isValidEmployeeGr() principle, execpt this method can be used with employee profile sys_id instead of user sys_id
     * returns Employee Profile GlideRecord object
     */
    isValidEmployeeByProfileIdGr: function(profileSysId, empDefinitionGr /*Optional*/ ) {
        var empProfileGr = new GlideRecord("sn_employee_profile");
        if (!empProfileGr.get(profileSysId)) {
            return false;
        }
        if (this.userSatisfiesEmployeeDefintion(empProfileGr.getValue('user'), empDefinitionGr))
            return empProfileGr;
        else return null;
    },

    /**
     * Same as isValidEmployee() API, but this method will return a GR instead of true/false
     * returns Employee Profile GlideRecord object
     */
    isValidEmployeeGr: function(userId, empDefinitionGr /*Optional*/ ) {
        var empProfileGr = new GlideRecord("sn_employee_profile");
        empProfileGr.addQuery('user', userId);
        empProfileGr.query();
        if (!empProfileGr.next()) {
            return false;
        }
        if (this.userSatisfiesEmployeeDefintion(userId, empDefinitionGr))
            return empProfileGr;
        else return null;
    },

    /**
     * Follows the main isValidEmployee() principle, execpt this method can be used with employee profile sys_id instead of user sys_id
     */
    isValidEmployeeByProfileId: function(profileSysId, empDefinitionGr /*Optional*/ ) {
        var empProfileGr = new GlideRecord("sn_employee_profile");
        if (!empProfileGr.get(profileSysId)) {
            return false;
        }
        return this.userSatisfiesEmployeeDefintion(empProfileGr.getValue('user'), empDefinitionGr);
    },

    /**
     * Validates if the user is a valid employee by checking its presenece in employee profile table and if its passing the latest employee definition filter
     * returns true/false
     */
    isValidEmployee: function(userId, empDefinitionGr /*Optional*/ ) {
        var empProfileGr = new GlideRecord("sn_employee_profile");
        empProfileGr.addQuery('user', userId);
        empProfileGr.query();
        if (!empProfileGr.hasNext()) {
            return false;
        }
        return this.userSatisfiesEmployeeDefintion(userId, empDefinitionGr);
    },

    /**
     * If domain is not present return current definition, if Domain is installed then
     * Method handles check for employee definition in current domain, if not present return global def
     */
    getEmployeeDefForDomain: function() {
        var empDefinitionGr;
        if (this.isDomainSeparationActive) {
            empDefinitionGr = this.getCurrentDefinitionInDomain(this.currentDomainId);
            if (gs.nil(empDefinitionGr)) {
                empDefinitionGr = this.getCurrentDefinitionInDomain('global');
            }
        } else {
            empDefinitionGr = this.getCurrentDefinition();
        }
        return empDefinitionGr;
    },

    /**
     * Validates the user against employee definition, if definition passed in argument otherwise uses the latest employee definition to validate.
     * return true/false
     */
    userSatisfiesEmployeeDefintion: function(userId, empDefinitionGr) {

        //If there is more than one employee definition check if user satisfies any one
        var gr = new GlideRecord("sn_employee_definition");
        gr.addActiveQuery();
        if (this.isDomainSeparationActive)
            gr.addQuery("sys_domain", this.currentDomainId);
        else
            gr.addQuery("sys_domain", 'global');
        gr.query();
        if (gr.getRowCount() >= 2)
            return this._checkUserSatisfiesMultipleDef(gr, userId);

        // If empDefinitionGr is passed then use the GR ELSE check if domain separation is active and fetch current definition
        // If Domain separation is inactive, query the current definition
        empDefinitionGr = (empDefinitionGr && empDefinitionGr.getTableName() === 'sn_employee_definition') ? empDefinitionGr : this.getEmployeeDefForDomain();

        if (empDefinitionGr) {
            var empDefinitionTable = empDefinitionGr.table;
            var profileGr = new GlideRecord(empDefinitionTable);
            profileGr.addEncodedQuery(empDefinitionGr.condition);
            if (empDefinitionTable.toString() === 'sn_hr_core_profile') {
                profileGr.addQuery('user.sys_id', userId);
            } else if (empDefinitionTable.toString() === 'sys_user') {
                profileGr.addQuery('sys_id', userId);
            }
            profileGr.setLimit(1);
            profileGr.query();
            return profileGr.hasNext();
        }
        return false;
    },

    /**
     * Checks if a user satisfies multiple definitions based on the provided GlideRecord.
     *
     * @param {GlideRecord} gr - The GlideRecord containing table names and conditions.
     * @param {string} userId - The sys_id of the user to check.
     * @returns {boolean} - Returns `true` if the user satisfies any of the conditions; otherwise, `false`.
     */
    _checkUserSatisfiesMultipleDef: function(gr, userId) {
        if (!userId)
            userId = gr.getUserID();
        while (gr.next()) {
            var empDefinitionTable = gr.table;
            var profileGr = new GlideRecord(empDefinitionTable);
            profileGr.addEncodedQuery(gr.condition);
            if (empDefinitionTable.toString() === 'sn_hr_core_profile')
                profileGr.addQuery('user.sys_id', userId);
            else if (empDefinitionTable.toString() === 'sys_user')
                profileGr.addQuery('sys_id', userId);
            profileGr.setLimit(1);
            profileGr.query();
            if (profileGr.hasNext())
                return true;
        }
        return false;
    },


    /**
     * Method queries for latest employee definition and processes query with appropriate prefix
     */
    getCurrentDefWithProcessedCondition: function() {
        var empDefinitionGr = this.getEmployeeDefForDomain();
        var processedQuery = null;
        if (!gs.nil(empDefinitionGr)) {
            var table = empDefinitionGr.getValue('table');
            var condition = empDefinitionGr.getValue('condition');
            if (!gs.nil(condition)) {
                if (table == 'sn_hr_core_profile') //append hr_profile dotwalk for core plugin
                    processedQuery = this.encodedQueryForProfiles("hr_profile.", condition);
                if (table == 'sys_user') //append user dotwalk for sys_user
                    processedQuery = this.encodedQueryForProfiles("user.", condition);
            }
        }
        return processedQuery;
    },

    getHRProfileGr: function(userId) {
        var isHrCoreActive = GlidePluginManager.isActive('com.sn_hr_core');
        if (!isHrCoreActive) {
            return null;
        }
        var gr = new GlideRecord("sn_hr_core_profile");
        if (gr.get("user", userId))
            return gr;
        return null;
    },

    /**
     * This API is for opting employee profile 
     * functionality
     */
    optIn: function() {
        this.updateOptInProperty(true);
        this.enableDisablePageRoutes(true);
        this.enableOrgChartPageRoute(true);
        return true;
    },
    /**
     * This API is for opting out employee profile 
     * functionality
     */
    optOut: function() {
        this.updateOptInProperty(false);
        this.enableDisablePageRoutes(false);
        this.enableOrgChartPageRoute(false);
        return true;
    },

    /**
     * This API is for enabling/disabling page routes
     * these page routes are for user profile to employee profile
     */
    enableDisablePageRoutes: function(isActive) {
        var gr = new GlideRecord("sp_page_route_map");
        gr.addEncodedQuery("sys_idIN8bec9e56530801104180ddeeff7b1295,e15dde56530801104180ddeeff7b12d4");
        gr.query();
        while (gr.next()) {
            gr.active = isActive;
            gr.update();
        }
    },

    /**
     * Enable/Disable page route map for my_org_chart to org_chart
     * based on if employee profile is enabled
     */
    enableOrgChartPageRoute: function(isActive) {
        sn_ex_sp_pro.OrgChartUtil &&
            new sn_ex_sp_pro.OrgChartUtil().enableOrgChartPageRoute(isActive);
    },

    /**
     * This API is for updating employee profile 
     * enabled property.
     */
    updateOptInProperty: function(value) {
        var gr = new GlideRecord("sys_properties");
        gr.addQuery('name', 'sn_employee.employee_profile_enabled');
        gr.query();
        while (gr.next()) {
            gr.value = value;
            gr.update();
        }
    },
    /**
     * This API is to tell if new org chart page exists
     * @return boolean
     * returns true if new page exist else return false
     **/
    isNewOrgChartPresent: function() {
        var spPageGr = new GlideRecord("sp_page");
        return spPageGr.get('sys_id', '8f8bcd52c3074110069aec4b7d40dd64');
    },

    //Gets the user criterias associated with the tab-widget mapping mtom tables
    _getWidgetMappingUserCriterias: function(table) {
        var criterias = {};
        var gr = new GlideRecord(table);
        gr.query();
        while (gr.next() && gr.getValue('user_criteria')) {
            if (criterias[gr.getValue('sn_employee_tab_widget_mapping')]) {
                criterias[gr.getValue('sn_employee_tab_widget_mapping')].push(gr.getValue('user_criteria'));
                continue;
            }
            criterias[gr.getValue('sn_employee_tab_widget_mapping')] = [gr.getValue('user_criteria')];
        }
        return criterias;
    },

    //Populate notAvailableForCriterias and AvailableForCriterias global objects
    _populateUserCriterias: function() {
        this.notAvailableForCriterias = this._getWidgetMappingUserCriterias('sn_employee_widget_mapping_user_criteria_no_mtom');
        this.availableForCriterias = this._getWidgetMappingUserCriterias('sn_employee_widget_mapping_user_criteria_mtom');
        this.isWidgetCriteriaPopulated = true;
    },

    /**
     * Returns a list of tabs (name and tabId)
     * @param {String} profileUserId - sys_id of sys_user record whose profile is being visited
     * @param {String} visitorUserId - sys_id of sys_user record who is visiting the profile
     * @param {String} portal - sys_id of the portal in which it is rendering
     * returns {List of objects} tabs
     */
    getAccessibleProfileTabs: function(profileUserId, visitorUserId, portal) {
        if (!this.isValidEmployee(profileUserId)) {
            return [{
                "tabId": "non-employee-tab",
                "name": "Non Employee Tab"
            }];
        }
        var tabs = {};
        var accessibilityOptions = this._getAccessibilityOptions(profileUserId, visitorUserId);
        var tabsWithUCWidgets = {};

        if (!this.isWidgetCriteriaPopulated) {
            this._populateUserCriterias();
        }

        var userPreference = this.getWidgetVisibilityPreference(profileUserId);
        var gr = new GlideRecord("sn_employee_tab_widget_mapping");
        gr.addActiveQuery();
        gr.addQuery("tab.active", "true");
        gr.orderBy("accessible_by");
        gr.orderBy("tab");
        gr.query();

        while (gr.next()) {
            // Check if the tab is already present in the tab list
            if (this._ifTabPresent(gr.getValue("tab"), tabs)) {
                continue;
            }
            // If the tab-widget mapping's accessible_by option is anything but 'user_criteria', directly add it to the final tab's list
            if (gr.getValue('accessible_by') != 'user_criteria') {
                var widgetVisibility = this._getWidgetVisibility(gr, userPreference);
                if (accessibilityOptions.indexOf(widgetVisibility) > -1) {
                    tabs[gr.getValue("tab")] = true;
                }
                continue;
            }
            //If accessible_by is user criteria
            if (tabsWithUCWidgets[gr.getValue("tab")]) {
                tabsWithUCWidgets[gr.getValue("tab")].push(gr.getUniqueValue());
                continue;
            }
            tabsWithUCWidgets[gr.getValue("tab")] = [gr.getUniqueValue()];
        }
        var tabList = Object.keys(tabsWithUCWidgets);
        for (var i = 0; i < tabList.length; i++) {
            if (this._ifTabPresent(tabList[i], tabs)) {
                continue;
            }
            var widgetMappings = tabsWithUCWidgets[tabList[i]];
            for (var j = 0; j < widgetMappings.length; j++) {
                // If any of the user criteria of user matches with any one of the 'Not Available For' user criteria list, reject it immediately
                var notAvailableFor = this.notAvailableForCriterias[widgetMappings[j]];
                if (!gs.nil(notAvailableFor) && sn_uc.UserCriteriaLoader.userMatches(visitorUserId, notAvailableFor)) {
                    continue;
                }

                // If any of the user criteria of user matches with any one of the 'Available For' user criteria list, add it to the final tab's list immediately
                var availableFor = this.availableForCriterias[widgetMappings[j]];
                if (gs.nil(availableFor) || sn_uc.UserCriteriaLoader.userMatches(visitorUserId, availableFor)) {
                    tabs[tabList[i]] = true;
                    break;
                }
            }
        }
        var orderedTabs = this._getOrderedTabs(Object.keys(tabs), portal);
        return orderedTabs;
    },

    //Get Ordered Tabs
    _getOrderedTabs: function(unorderedTabs, portal) {
        var orderedTabs = [];
        var gr = new GlideRecord("sn_employee_tab");
        gr.addActiveQuery();
        gr.addQuery("sys_id", "IN", unorderedTabs);
        gr.orderBy("order");
        gr.orderBy("name");
        gr.query();
        while (gr.next()) {
            var tab = {};
            tab.tabId = gr.getUniqueValue();
            tab.name = gr.getDisplayValue("primary_name") ? gr.getDisplayValue("primary_name") : gr.getDisplayValue("name");
            if (this._isTabConfiguredForPortal(portal, gr))
                orderedTabs.push(tab);
        }
        return orderedTabs;
    },

    //Helper function to check if particular tab is configured in portal config
    _isTabConfiguredForPortal: function(portal, tabGr) {
        var portalConfigGR = this.portalConfigGR ? this.portalConfigGR : this.getPortalConfiguration(portal);
        if (!portalConfigGR) {
            return global.JSUtil.getBooleanValue(tabGr, "default");
        }

        var tabsinPortal = this._getTabsInPortal(portalConfigGR.getUniqueValue());
        return tabsinPortal.indexOf(tabGr.getUniqueValue()) >= 0;
    },

    //Helper function to get tabs configured in a particular portal config record
    _getTabsInPortal: function(portalConfigSysId) {
        if (this.tabsinPortalConfig)
            return this.tabsinPortalConfig;

        var tabs = [];
        var tabportalm2mGR = new GlideRecord('sn_employee_m2m_tab_portal_configuration');
        tabportalm2mGR.addQuery('sn_employee_portal_configuration', portalConfigSysId);
        tabportalm2mGR.query();
        while (tabportalm2mGR.next()) {
            tabs.push(tabportalm2mGR.getValue("sn_employee_tab"));
        }
        this.tabsinPortalConfig = tabs;
        return tabs;
    },

    //Get the accessibility options 
    _getAccessibilityOptions: function(profileUserId, visitorUserId) {
        var accessibilityOptions = [];
        var userGr = new GlideRecord('sys_user');
        userGr.get(profileUserId);
        var managerId = userGr.getValue('manager');

        if (visitorUserId === profileUserId) { // If user viewing profile is employee itself
            accessibilityOptions = ["employee_only", "employee_and_manager", "everyone", "user_criteria", "emp_sec_mgrs_and_mgr"];
        } else if (visitorUserId === managerId) { // If user viewing profile is a manager of employee
            accessibilityOptions = ["manager_only", "employee_and_manager", "everyone", "user_criteria", "mgr_and_sec_mgrs", "emp_sec_mgrs_and_mgr"];
        } else if (this.isloggedInUserSecondaryManager(profileUserId, visitorUserId)) { // If user viewing profile is a secondary manager of employee
            accessibilityOptions = ["mgr_and_sec_mgrs", "emp_sec_mgrs_and_mgr", "everyone", "user_criteria"];
        } else {
            accessibilityOptions = ["everyone", "user_criteria"];
        }

        return accessibilityOptions;
    },

    /**
     * Checks if user viewing the profile is one of the secondary manager of employee whose profile is currently queried on.
     * @param {String} profileUserId - sys_id of sys_user record whose profile is being visited
     * @param {String} visitorUserId - sys_id of sys_user record who is visiting the profile
     * @return {Boolean}  
     */
    isloggedInUserSecondaryManager: function(profileUserId, visitorUserId) {
        if (gs.tableExists(this.SEC_MANAGER_RELATIONSHIP_TABLE)) {
            var empProfileUserGR = this.isValidEmployeeGr(profileUserId); // fetch employee profile record for corresponding sys user ID.
            var visitorUserEmpProfileGR = this.isValidEmployeeGr(visitorUserId); // fetch employee profile record for corresponding sys user ID.
            // Exit if employee profile does not exist
            if (!(empProfileUserGR && visitorUserEmpProfileGR)) {
                return false;
            }
            var userEmpProfileID = empProfileUserGR.getValue('sys_id'); // employee profile Sys ID of user whose profile is being visited.
            var visitorUserEmpProfileID = visitorUserEmpProfileGR.getValue('sys_id'); // employee profile Sys ID of logged in user.

            var secondaryMgrGr = new GlideRecord(this.SEC_MANAGER_RELATIONSHIP_TABLE);
            secondaryMgrGr.addQuery('employee', userEmpProfileID);
            secondaryMgrGr.addQuery('secondary_manager', visitorUserEmpProfileID);
            secondaryMgrGr.query();

            if (secondaryMgrGr.next()) {
                return true;
            }
        }

        return false;
    },

    //Checks if the tab is already present in the tabs list
    _ifTabPresent: function(id, tabs) {
        return tabs[id] ? true : false;
    },

    /**
     * Returns a list of widgets (name, id and widgeOptions)
     * @param {String} tab - sys_id of sn_employee_tab record
     * returns {List of objects} widgets
     */
    getWidgets: function(tab, profileUserId, visitorUserId) {
        if (tab === "non-employee-tab") {
            return this.getNonEmployeeWidgets();
        }
        var widgets = [];
        var accessibilityOptions = this._getAccessibilityOptions(profileUserId, visitorUserId);
        if (!this.isWidgetCriteriaPopulated) {
            this._populateUserCriterias();
        }

        var userPreference = this.getWidgetVisibilityPreference(profileUserId);
        var gr = new GlideRecord("sn_employee_tab_widget_mapping");
        gr.addQuery("tab", tab);
        gr.addActiveQuery();
        gr.orderBy("order");
        gr.orderBy("name");
        gr.query();
        while (gr.next()) {
            var widgetVisibility = this._getWidgetVisibility(gr, userPreference);
            if (accessibilityOptions.indexOf(widgetVisibility) > -1) {
                if (gr.getValue("accessible_by") == "user_criteria") {
                    var notAvailableFor = this.notAvailableForCriterias[gr.getUniqueValue()];
                    if (!gs.nil(notAvailableFor) && sn_uc.UserCriteriaLoader.userMatches(visitorUserId, notAvailableFor)) {
                        continue;
                    }

                    var availableFor = this.availableForCriterias[gr.getUniqueValue()];
                    if (!gs.nil(availableFor) && !sn_uc.UserCriteriaLoader.userMatches(visitorUserId, availableFor)) {
                        continue;
                    }
                }

                var widget = {};
                widget.name = gr.getDisplayValue("name");
                widget.id = gr.getUniqueValue();
                widget.tabId = tab;
                widget.widgetId = gr.getValue('widget');
                widget.options = this._populateWidgetOptions(gr);
                widgets.push(widget);
            }
        }
        return widgets;
    },

    _populateWidgetOptions: function(widgetMappingGr) {
        var widgetOptions = JSON.parse(widgetMappingGr.getValue("widget_parameters"));
        var finalWidgetOptions = widgetOptions ? widgetOptions : {};
        finalWidgetOptions.widgetTitle = widgetMappingGr.getDisplayValue("name");
        finalWidgetOptions.tabWidgetMappingId = widgetMappingGr.getUniqueValue();
        finalWidgetOptions.isUserSelectionEnabled = widgetMappingGr.getValue('allow_visibility_control') == true;
        return JSON.stringify(finalWidgetOptions);
    },

    /**
     * Returns whether logged in user can view the widget in a particular tab
     * @param {String} widgetMappingId - sys_id of tab-widget mapping record
     * @param {String} visitorId - sys_id of the logged in user
     * @param {String} profileUserId - userid of profile owner
     * @returns {boolean} 
     */

    isWidgetVisibleForUser: function(widgetMappingId, visitorUserId, profileUserId) {
        var accessibilityOptions = this._getAccessibilityOptions(profileUserId, visitorUserId);
        var widgetVisibility = this.getWidgetVisibilityOnTabs(widgetMappingId, profileUserId);
        if (accessibilityOptions.indexOf(widgetVisibility) > -1) {
            if (widgetVisibility == 'user_criteria') {
                var userCriterias = this._getUserCriterForWidgetMapping(widgetMappingId);
                if (userCriterias['notAvailableFor'].length && sn_uc.UserCriteriaLoader.userMatches(visitorUserId, userCriterias['notAvailableFor'])) {
                    return false;
                }

                if (userCriterias['availableFor'].length && !sn_uc.UserCriteriaLoader.userMatches(visitorUserId, userCriterias['availableFor'])) {
                    return false;
                }
            }
            return true;
        }
        return false;
    },

    /**
     * Returns an object  containing the list of available for and not avaible for criterias defined for a widget mapping 
     * @param {String} widgetMappingId - sys_id of tab-widget mapping record
     * @returns {Object} 
     */

    _getUserCriterForWidgetMapping: function(widgetMappingId) {
        var criterias = {};
        criterias['notAvailableFor'] = this._populateUserCriterForWidgetMapping(this.NOT_AVAILABLE_M2M_TABLE, widgetMappingId);
        criterias['availableFor'] = this._populateUserCriterForWidgetMapping(this.AVAILABLE_M2M_TABLE, widgetMappingId);
        return criterias;
    },

    /**
     * Populates and returns the array of user criteria for an m2m table defined on a widget mapping
     * @param {String} table - Name of the m2m table 
     * @param {String} widgetMappingId - sys_id of tab-widget mapping record
     * @returns {Array} 
     */

    _populateUserCriterForWidgetMapping: function(table, widgetMappingId) {
        var userCriterias = [];
        var m2mGr = new GlideRecord(table);
        m2mGr.addQuery("sn_employee_tab_widget_mapping", widgetMappingId);
        m2mGr.query();
        while (m2mGr.next()) {
            userCriterias.push(m2mGr.getValue('user_criteria'));
        }
        return userCriterias;
    },


    /**
     * Returns widget's visibility by honouring user's preference.
     * @param {String} widgetMappingId - sys_id of tab-widget mapping record
     * @param {String} profileUserId - user id of profile owner
     * @returns {String}
     */
    getWidgetVisibilityOnTabs: function(widgetMappingId, profileUserId) {
        var widgetMappingGr = new GlideRecord("sn_employee_tab_widget_mapping");
        widgetMappingGr.get(widgetMappingId);
        var userPreference = this.getWidgetVisibilityPreference(profileUserId);
        return this._getWidgetVisibility(widgetMappingGr, userPreference);
    },


    /**
     * Returns widget's visibility by honouring user's preference.
     * @param {GlideRecord} widgetMappingGr - tab-widget mapping record.
     * @param {Object} userPreference - user preference. 
     * @returns {String}
     */
    _getWidgetVisibility: function(widgetMappingGr, userPreference) {
        var overridableWidgetVisibility = ep_Constants.OVERRIDABLE_WIDGET_VISIBILITY;
        var accessibleBy = widgetMappingGr.getValue('accessible_by');
        if (widgetMappingGr.getValue('allow_visibility_control') == true && overridableWidgetVisibility.indexOf(accessibleBy) > -1) {
            var widgetMappingId = widgetMappingGr.getUniqueValue();
            return userPreference && userPreference[widgetMappingId] && overridableWidgetVisibility.indexOf(userPreference[widgetMappingId]) > -1 ?
                userPreference[widgetMappingId] :
                accessibleBy;
        } else {
            return accessibleBy;
        }
    },

    /**
     * Returns the widget visibility preference of a given user
     * @param {String} userId - sys_id of sys_user record
     * returns {Object}
     */
    getWidgetVisibilityPreference: function(userId) {
        var preferenceGr = new GlideRecord("sys_user_preference");
        preferenceGr.addQuery("name", ep_Constants.WIDGET_VISIBILITY_USER_PREFERENCE);
        preferenceGr.addQuery("user", userId);
        preferenceGr.setLimit(1);
        preferenceGr.query();
        if (preferenceGr.next()) {
            return JSON.parse(preferenceGr.getValue("value"));
        }
        return null;
    },

    /**
     * Sets the visibility of a widget in user preference for the logged in user
     * @param {String} widgetMappingId - sys_id of tab-widget mapping record
     * @param {String} visibilityPreference - visibility selected by user 
     */
    saveWidgetVisibilityPreference: function(widgetMappingId, visibilityPreference) {
        var overridableWidgetVisibility = ep_Constants.OVERRIDABLE_WIDGET_VISIBILITY;
        if (overridableWidgetVisibility.indexOf(visibilityPreference) === -1) {
            return;
        }
        var widgetMapping = new GlideRecord("sn_employee_tab_widget_mapping");
        widgetMapping.get(widgetMappingId);
        if (!widgetMapping.isValid()) {
            return;
        }
        var preference = this.getWidgetVisibilityPreference(gs.getUserID());
        var accessibleBy = this._getWidgetVisibility(widgetMapping, preference);
        if (accessibleBy === visibilityPreference) {
            return;
        }
        preference = preference ? preference : {};
        preference[widgetMappingId] = visibilityPreference;
        gs.getUser().savePreference(ep_Constants.WIDGET_VISIBILITY_USER_PREFERENCE, JSON.stringify(preference));
    },

    /**
     * Returns the visibility of the Public Profile Visibility widget to true on the basis of the portal page
     * @param {String} pageId - id of the portal page
     * returns {Boolean}
     */
    isPublicProfileVisibilityWidgetVisibleOnPage: function(pageId) {
        var pages = ['employee_profile'];
        if (this.isEmployeeProfileEnabled()) {
            pages.push('hri_user_profile');
            pages.push('user_profile');
        }
        return (pageId && pages.indexOf(pageId) >= 0);
    },

    /**
     * Checks whether the logged in user is viewing his/her profile page
     * @param {String} userId - sys_id of the user viewing the profile page
     */
    isLoggedInUsersProfile: function(userId) {
        return userId ? (gs.getUserID() === userId) : true;
    },
    /**
     * Get a list of the widgets that should be shown for a non-employee profile
     * Overview Widget
     * My Teams Widget
     * My Documents Widget
     * My Delegates Widget
     * My Contacts Widget
     */
    getNonEmployeeWidgets: function() {
        var widgets = [];
        var overviewWidget = {
            "name": gs.getMessage("Overview"),
            "id": "overview",
            "tabId": "non-employee-tab",
            "widgetId": "56fc512453333010fedfddeeff7b1273",
            "options": ""
        };
        widgets.push(overviewWidget);
        var myTeamsWidget = {
            "name": gs.getMessage("Team"),
            "id": "my_teams",
            "tabId": "non-employee-tab",
            "widgetId": "cfcbbf7c30b3b010f8772514c50e7062",
            "options": JSON.stringify({
                widgetTitle:  gs.getMessage('Team')
            })
        };
        widgets.push(myTeamsWidget);
        if (GlidePluginManager.isActive('com.sn_employee_document_management')) {
            var myDocumentsWidget = {
                "name": gs.getMessage("My Documents"),
                "id": "my_documents",
                "tabId": "non-employee-tab",
                "widgetId": "6f86d215531013003585c3c606dc3411",
                "options": ""
            };
            widgets.push(myDocumentsWidget);
        }
        if (GlidePluginManager.isActive('com.glide.granular_service_delegation')) {
            var myDelegatesWidget = {
                "name": gs.getMessage("My Delegates"),
                "id": "my_delegates",
                "tabId": "non-employee-tab",
                "widgetId": "bc49147bb3321010f5302ddc16a8dc33",
                "options": ""
            };
            widgets.push(myDelegatesWidget);
        }
        if (GlidePluginManager.isActive('com.sn_hr_core')) {
            var myContactsWidget = {
                "name": gs.getMessage("My Contacts"),
                "id": "my_contacts",
                "tabId": "non-employee-tab",
                "widgetId": "b9e232209f22120047a2d126c42e70ba",
                "options": ""
            };
            widgets.push(myContactsWidget);
        }
        return widgets;
    },

    /**
     * Returns the visibility options which user can override
     * returns {Array}
     */
    getVisibilityOptions: function() {
        var visibilityOptions = [];
        visibilityOptions = visibilityOptions.concat(ep_Constants.VISIBILITY_OPTIONS);
        // Check if other manager realtionship table exists before adding "other manager" in visibility options
        if (gs.tableExists(this.SEC_MANAGER_RELATIONSHIP_TABLE)) {
            visibilityOptions.push({
                "value": "emp_sec_mgrs_and_mgr",
                "label": gs.getMessage("You, your manager and other managers")
            });
        }

        visibilityOptions.push({
            "value": "everyone",
            "label": gs.getMessage("Everyone")
        });
        return visibilityOptions;
    },

    /**
     * Returns the accessibility message
     * @param {String} widgetMappingId - widget mapping id
     * @param {String} userId - user id
     * returns {String}
     */
    getAccessibilityMsg: function(widgetMappingId, userId) {
        var accessibilityMsgs = ep_Constants.ACCESSIBILITY_MSGS;
        var widgetVisibilityOnTabs = this.getWidgetVisibilityOnTabs(widgetMappingId, userId);
        var accessibilityMsg = accessibilityMsgs[widgetVisibilityOnTabs] || "";
        return accessibilityMsg;
    },

    /**
     * Checks whether the user visibility control has been enabled for the tab widget mapping
     * @param {String} widgetMappingId - widget mapping id
     * returns {Boolean}
     */
    isUserSelectionEnabled: function(widgetMappingId) {
        var tabWidgetMappingGr = new GlideRecord("sn_employee_tab_widget_mapping");
        tabWidgetMappingGr.get(widgetMappingId);
        return (tabWidgetMappingGr.getValue("allow_visibility_control") == true);
    },

    /**
     * Return role sys id based name of role
     * @param {String} Role name
     * @returns {String} Role sys id
     */
    getRoleSysId: function(role) {
        var roleGr = new GlideRecord("sys_user_role");
        roleGr.addQuery("name", role);
        roleGr.query();

        if (roleGr.next()) {
            return roleGr.getUniqueValue();
        }

        return;
    },

    /*
     * Prefixes give keyword to condition string
     * Sample Input: active=true^company=c9818d2c4a36231201624433851894bb^EQ
     * Sample Output:user.active=true^user.company=c9818d2c4a36231201624433851894bb^EQ
     * @parm prefix - String
     * @parm query - Condition string
     * @return query - Prefixed conidtion string
     */
    encodedQueryForProfiles: function(prefix, query) {
        //There is limitation from platfrom to query roles type field through encoded query
        //in database views hence we are making join with sys_user_has_role table with
        //sn_employee_profile_mobile view and converting the query if it contains roles field
        //into role field from sys_user_has_role table in the sn_employee_profile_mobile view

        if (prefix == 'sysuser_' && query && query.length >= 7 && query.substring(0, 6) == "roles=") {
            var index = query.indexOf('^', 0);
            var role = query.substring(6, index);
            var roleId = this.getRoleSysId(role);
            query = 'suhr_' + 'role=' + roleId + query.substring(index);
        } else {
            query = prefix + query;
        }
        var pos = 0;
        for (var i = 0; i < query.length && pos != -1; i++) {
            pos = query.indexOf('^', i);
            if (pos != -1) {
                i = pos;
                if (pos + 3 < query.length && (query.substring(pos + 1, pos + 3) == 'NQ' || query.substring(pos + 1, pos + 3) == 'OR')) {
                    if ((prefix == 'sysuser_') && (query.substring(pos + 3, pos + 9) == 'roles=')) {
                        index = query.indexOf('^', pos + 1);
                        role = query.substring(pos + 9, index);
                        roleId = this.getRoleSysId(role);
                        query = query.substring(0, pos + 3) + 'suhr_' + 'role=' + roleId + query.substring(index);
                    } else {
                        query = query.substring(0, pos + 3) + prefix + query.substring(pos + 3);
                    }
                } else {
                    if (query.substring(pos) != '^EQ') {
                        if ((prefix == 'sysuser_') && (query.substring(pos + 1, pos + 7) == 'roles=')) {
                            index = query.indexOf('^', pos + 1);
                            role = query.substring(pos + 7, index);
                            roleId = this.getRoleSysId(role);
                            query = query.substring(0, pos + 1) + 'suhr_' + 'role=' + roleId + query.substring(index);
                        } else {
                            query = query.substring(0, pos + 1) + prefix + query.substring(pos + 1);
                        }
                    }
                }
            }
        }

        return query;
    },

    checkForRecordAccess: function(recordGR, hasDeleteAccess) {
        if (recordGR) {
            var hasAccess = recordGR.canRead();
            if (hasDeleteAccess)
                hasAccess = hasAccess && (recordGR.canDelete() || gs.hasRole(ep_Constants.ROLES.EMPLOYEE_ADMIN));
            return hasAccess;
        }
        return gs.hasRole(this.ROLES.ESC_ADMIN) || gs.hasRole(ep_Constants.ROLES.EMPLOYEE_ADMIN);
    },

    /**
     * Returns  Header Configuration Data for non employee for deskless portal
     * returns - JSON object of config data
     */
    getNonEmployeeDesklessHeaderConfigData: function() {
        return {
            showPronoun: false,
            showBGImage: false,
            actions: '',
            editImages: false,
            disableLinks: true,
        };
    },

    /**
     * Returns  Header Configuration Data for non employee
     * @param {portal} - sys_id of portal 
     * returns - JSON object of config data
     */
    getNonEmployeeHeaderConfigData: function(portal) {
        if (portal == ep_Constants.DESKLESS_PORTAL)
            return this.getNonEmployeeDesklessHeaderConfigData();

        return {
            showPronoun: true,
            showBGImage: true,
            actions: ep_Constants.OOB_DEFAULT_ACTION_GROUP,
            editImages: true,
            disableLinks: false,
        };
    },

    /**
     * Returns Portal Configuration GlideRecord
     * @param {portal} - sys_id of portal to fetch config record
     * returns - GlideRecord
     */
    getPortalConfiguration: function(portal, domain /*Optional*/ ) {
        var EP_PORTAL_CONFIG = ep_Constants.TABLES.EP_PORTAL_CONFIG;

        var portalConfigGR = new GlideRecord(EP_PORTAL_CONFIG.NAME);
        portalConfigGR.addActiveQuery();
        portalConfigGR.addQuery(EP_PORTAL_CONFIG.FIELDS.PORTAL, portal);
        portalConfigGR.orderBy(EP_PORTAL_CONFIG.FIELDS.ORDER);
        portalConfigGR.orderByDesc(EP_PORTAL_CONFIG.FIELDS.CREATED);
        if (this.isDomainSeparationActive) {
            var domainName = domain ? domain : this.currentDomainId;
            portalConfigGR.addQuery(EP_PORTAL_CONFIG.FIELDS.DOMAIN, domainName);
        }
        portalConfigGR.query();

        if (portalConfigGR.next()) {
            this.portalConfigGR = portalConfigGR;
            return portalConfigGR;
        } else if (this.isDomainSeparationActive && domain != "global") { //Scenario when config is not presnet in domian, fallback to global
            return this.getPortalConfiguration(portal, "global");
        }


        return null;
    },

    /**
     * Build JSON data from given header config record
     * returns - JSON object of config data
     */
    buidHeaderConfigDataFromGR: function(headerConfigGR) {
        if (gs.nil(headerConfigGR))
            return {};
        var HEADER_CONFIG = ep_Constants.TABLES.EP_HEADER_CONFIG;
        return {
            actions: headerConfigGR.getValue(HEADER_CONFIG.FIELDS.ACTIONS),
            showBGImage: global.JSUtil.getBooleanValue(headerConfigGR, HEADER_CONFIG.FIELDS.BG_IMAGE),
            disableLinks: global.JSUtil.getBooleanValue(headerConfigGR, HEADER_CONFIG.FIELDS.DISABLE_LINKS),
            editImages: global.JSUtil.getBooleanValue(headerConfigGR, HEADER_CONFIG.FIELDS.EDIT_IMAGES),
            showPronoun: global.JSUtil.getBooleanValue(headerConfigGR, HEADER_CONFIG.FIELDS.SHOW_PRONOUN),
            userNameTemplate: headerConfigGR.getValue(HEADER_CONFIG.FIELDS.USER_NAME_TEMPLATE),
            secondaryInfoFields: headerConfigGR.getValue(HEADER_CONFIG.FIELDS.SECONDARY_INFO_FIELDS),
            showPresence: global.JSUtil.getBooleanValue(headerConfigGR, HEADER_CONFIG.FIELDS.SHOW_PRESENCE),
            channel: headerConfigGR.getValue(HEADER_CONFIG.FIELDS.CHANNEL)
        };
    },

    /**
     * Returns Default Header Configuration Data  when config record is not present
     * @param {domain} - Doiman to fetch the data
     * returns - JSON object of default config data
     */
    getDefaultHeaderConfigData: function(domain /*Optional*/ ) {
        var HEADER_CONFIG = ep_Constants.TABLES.EP_HEADER_CONFIG;

        var headerConfigGR = new GlideRecord(HEADER_CONFIG.NAME);
        headerConfigGR.addQuery(HEADER_CONFIG.FIELDS.DEFAULT, true);
        headerConfigGR.orderByDesc(HEADER_CONFIG.FIELDS.CREATED);
        if (this.isDomainSeparationActive) {
            var domainName = domain ? domain : this.currentDomainId;
            headerConfigGR.addQuery(HEADER_CONFIG.FIELDS.DOMAIN, domainName);
        }
        headerConfigGR.setLimit(1);
        headerConfigGR.query();

        if (headerConfigGR.next()) {
            return this.buidHeaderConfigDataFromGR(headerConfigGR);
        } else if (this.isDomainSeparationActive && domain != "global") { //Scenario when config is not presnet in domian, fallback to global
            return this.getDefaultHeaderConfigData("global");
        }

        return {};
    },

    /**
     * Returns Header Configuration Data based on Record or default if record is not present
     * @param {portal} - sys_id of portal to fetch data for
     * returns - JSON object of config data
     */
    getHeaderConfigData: function(portal) {

        try {
            var portalConfigGR = this.getPortalConfiguration(portal);
            if (!portalConfigGR) {
                return this.getDefaultHeaderConfigData();
            }

            var PORTAL_CONFIG = ep_Constants.TABLES.EP_PORTAL_CONFIG;

            var headerConfigGR = portalConfigGR.getElement(PORTAL_CONFIG.FIELDS.HEADER_CONFIG).getRefRecord();
            var headerConfigData = this.buidHeaderConfigDataFromGR(headerConfigGR);

            return headerConfigData;
        } catch (err) {
            gs.error(err);
            return {};
        }
    },

    /**
     * Validates the Employee Profile tables before submitting or inserting the records
     * @param {employeeProfileTablesGr} - GlideRecord for Employee Profile tables namely Languages Spoken, Employement Histories, Education and trainings.
     */
    validateRecordBeforeSubmit: function(employeeProfileTablesGr) {
        try {
            if (GlidePluginManager.isActive('com.sn_asc') && !gs.nil(employeeProfileTablesGr.alumni_user)) {
                return;
            }
            this._validateAnyProfileIsFilled(employeeProfileTablesGr);
            this._validateUserforEPAndPP(employeeProfileTablesGr);
            var employeeProfileUserID = !gs.nil(employeeProfileTablesGr.employee_profile) ? employeeProfileTablesGr.employee_profile.user.toString() : null;

            if (!gs.nil(employeeProfileUserID) && !this.isValidEmployee(employeeProfileUserID))
                throw gs.getMessage("The employee profile is invalid");

            if (employeeProfileTablesGr.getTableName() === "sn_employee_languages_spoken" && employeeProfileTablesGr.primary.toString() === "true")
                this._validateIfAnyExisitingRecord(employeeProfileTablesGr);
        } catch (error) {
            gs.addErrorMessage(error);
            employeeProfileTablesGr.setAbortAction(true);
        }
    },

    _validateIfAnyExisitingRecord: function(employeeProfileTablesGr) {
        var query = "primary=true";
        var userID = employeeProfileTablesGr.employee_profile && employeeProfileTablesGr.employee_profile.user.toString();
        if (GlidePluginManager.isActive('com.sn_professional')) {
            userID = userID || employeeProfileTablesGr.professional_profile && employeeProfileTablesGr.professional_profile.user.toString();
            query += "^professional_profile.user=" + userID + "^ORemployee_profile.user=" + userID;
        } else {
            query += "^employee_profile.user=" + userID;
        }
        var gr = new GlideRecord(employeeProfileTablesGr.getTableName());
        gr.addEncodedQuery(query);
        gr.query();
        if (gr.next() && gr.getValue("sys_id") != employeeProfileTablesGr.sys_id)
            throw gs.getMessage("A primary record already exists for the current profile");
    },

    _validateUserforEPAndPP: function(employeeProfileTablesGr) {
        if (GlidePluginManager.isActive('com.sn_professional')) {
            var employeeProfileUserID = employeeProfileTablesGr.employee_profile.user && employeeProfileTablesGr.employee_profile.user.toString();
            var professionalProfileUserID = employeeProfileTablesGr.professional_profile.user && employeeProfileTablesGr.professional_profile.user.toString();
            if (!gs.nil(employeeProfileUserID) && !gs.nil(professionalProfileUserID)) {
                if (employeeProfileUserID !== professionalProfileUserID)
                    throw gs.getMessage("Employee profile and Professional profile can't have different user field");
            }
        }
    },

    _validateAnyProfileIsFilled: function(employeeProfileTablesGr) {
        if (GlidePluginManager.isActive('com.sn_professional')) {
            if (gs.nil(employeeProfileTablesGr.professional_profile) && gs.nil(employeeProfileTablesGr.employee_profile))
                throw gs.getMessage("Map either Professional Profile or Employee Profile. Both of these fields can't be empty.");
        } else if (gs.nil(employeeProfileTablesGr.employee_profile))
            throw gs.getMessage("Employee profile can't be empty");
    },

    dataLookUp: function(profileRecord) {
        if (GlidePluginManager.isActive('com.sn_professional')) {
            var employeeProfileUserId = profileRecord.employee_profile.user && profileRecord.employee_profile.user.toString();
            var professionalProfileUserId = profileRecord.professional_profile.user && profileRecord.professional_profile.user.toString();
            if (!gs.nil(employeeProfileUserId) && gs.nil(professionalProfileUserId))
                return this._filterRecords(employeeProfileUserId);
            else if (!gs.nil(professionalProfileUserId) && gs.nil(employeeProfileUserId))
                return this._filterRecords(professionalProfileUserId);
        }
    },

    dataLookUpForUnlockedProfiles: function(current) {
        var loggedInUser = gs.getUserID();
        var isWriter = gs.hasRole('sn_professional.profile_writer') || gs.hasRole('sn_hc_professional.profile_writer');

        if (isWriter)
            return this.dataLookUp(current)

        return 'user=' + loggedInUser + '^locked=false';
    },

    _filterRecords: function(user) {
        var filterCond = 'user=' + user;
        return filterCond;
    },

    type: 'ep_UtilsSNC'
};
