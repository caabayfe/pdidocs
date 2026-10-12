var ep_portalUtilSNC = Class.create();
ep_portalUtilSNC.prototype = {
    initialize: function(userId) {
        this.epUtils = new sn_employee.ep_Utils();
        this.defaultBanner = "1a8b35b0070c01108d6d78e99cd30063";
        if (userId) {
            this.isValidEmployee = this.epUtils.isValidEmployee(userId);
            // employeeProfileGR: GlideRecord of employee profile currently queried on.
            this.employeeProfileGR = this.epUtils.getEmployeeProfileRecord(userId);
            this.sysUserGR = this.epUtils.getSysUserRecord(userId);
            this.hrProfileGR = this.epUtils.getHRProfileRecord(userId);
            this.isOverviewSectionFieldCriteriaPopulated = false;
            this.notAvailableForCriterias = {};
            this.availableForCriterias = {};
            this.NOT_AVAILABLE_M2M_TABLE = "sn_employee_overview_section_field_user_criteria_no_mtom";
            this.AVAILABLE_M2M_TABLE = "sn_employee_overview_section_field_user_criteria_mtom";
            this.OVERVIEW_SECTION_FIELD = "sn_employee_overview_section_field";
        }
        this.loggedInUserSysId = gs.getUserID();
        this.loggedInUserEmployeeProfileGR = this.epUtils.getEmployeeProfileRecord(this.loggedInUserSysId);
        this.editableFields = {
            'short_bio': {
                maxlength: 255,
                fieldType: 'textarea'
            },
            'nickname': {
                maxlength: 40,
                fieldType: 'string'
            },
            'preferred_pronoun': {
                fieldType: 'choice',
                options: this.getChoiceFieldOptions('preferred_pronoun')
            }
        };
        this.userSelectablePublicFields = ['preferred_pronoun'];
        this.isLoggedInUserProfile = (this.loggedInUserSysId == userId);
    },

    /**
     * returns {Boolean} Boolean indicating whether employee profile record exists and is a valid employee record
     */
    hasValidEmployeeRecord: function() {
        return this.isValidEmployee;
    },

    //Gets the user criterias associated with all the overview section fields from mtom tables
    _getOverviewSectionFieldUserCriterias: function(table, sectionsList) {
        var criterias = {};
        var m2mGr = new GlideRecord(table);
        if (sectionsList && sectionsList.length)
            m2mGr.addQuery("sn_employee_overview_section_field.section", "IN", sectionsList);
        m2mGr.addEncodedQuery("sn_employee_overview_section_field.active=true");
        m2mGr.addEncodedQuery("user_criteria.active=true");
        m2mGr.query();

        while (m2mGr.next()) {
            var userCriteria = m2mGr.getValue('user_criteria');
            var overviewSectionField = m2mGr.getValue(this.OVERVIEW_SECTION_FIELD);
            if (gs.nil(criterias[overviewSectionField])) {
                criterias[overviewSectionField] = [];
            }
            criterias[overviewSectionField].push(userCriteria);
        }
        return criterias;
    },

    //Populate notAvailableForCriterias and AvailableForCriterias global objects
    _populateUserCriterias: function(sectionsList) {
        this.notAvailableForCriterias = this._getOverviewSectionFieldUserCriterias(this.NOT_AVAILABLE_M2M_TABLE, sectionsList);
        this.availableForCriterias = this._getOverviewSectionFieldUserCriterias(this.AVAILABLE_M2M_TABLE, sectionsList);
        this.isOverviewSectionFieldCriteriaPopulated = true;
    },

    // Method queries from m2m table based on tabWidgetMapId, sorted by order and section name
    getSectionsForWidgetMapping: function(tabWidgetMapId) {
        var sectionsList = [];
        var sectionsForTabGr = new GlideRecord("sn_employee_m2m_tabwidget_section");
        sectionsForTabGr.addActiveQuery();
        sectionsForTabGr.addQuery("sn_employee_tab_widget_mapping", tabWidgetMapId);
        sectionsForTabGr.orderBy("order");
        sectionsForTabGr.orderBy("sn_employee_overview_section.name");
        sectionsForTabGr.query();
        while (sectionsForTabGr.next()) {
            sectionsList.push(sectionsForTabGr.getValue("sn_employee_overview_section"));
        }
        return sectionsList;
    },

    /**
       @param : deviceType => Not mandatory, if mobile is sent, then it will create the encoded query to only get mobile sections, otherwise will get portal visible fields
       Returns all available overview sections for specified employee
	   returns {Array} Array of overview sections visible to logged in user
     */
    getOverviewSections: function(deviceType, tabWidgetMapId) {
        // query all the m2m sections for the tabWidgetMapId in widget instance
        var sectionsList = tabWidgetMapId ? this.getSectionsForWidgetMapping(tabWidgetMapId) : [];
        var employeeProfileGR = this.employeeProfileGR;
        var nonEmptySections = [];

        if (!this.hasValidEmployeeRecord() || gs.nil(employeeProfileGR)) {
            if (!deviceType)
                return this.getNonEmployeeSections();
            return [];
        }

        if (sectionsList.length || deviceType === "mobile") {
            var encodedQueryForVisibility = deviceType === "mobile" ? "section_visibilityINmobile,both" : "section_visibilityINportal,both";
            var overviewSectionIDs = [];
            var overviewSections = {};
            var userId = employeeProfileGR.getValue('user');

            // fetch the user criteria for all active Overview Section Fields
            if (!this.isOverviewSectionFieldCriteriaPopulated) {
                this._populateUserCriterias();
            }

            var overviewSectionGR = new GlideRecord('sn_employee_overview_section');
            if (sectionsList.length) {
                overviewSectionGR.addQuery("sys_id", "IN", sectionsList);
            } else {
                overviewSectionGR.orderBy('order');
                overviewSectionGR.orderBy('name');
            }
            overviewSectionGR.addActiveQuery();
            overviewSectionGR.addEncodedQuery(encodedQueryForVisibility);
            overviewSectionGR.query();


            while (overviewSectionGR.next()) {
                var sectionId = overviewSectionGR.getUniqueValue();
                overviewSectionIDs.push(sectionId);
                overviewSections[sectionId] = {
                    'sysId': sectionId,
                    'name': overviewSectionGR.getDisplayValue('name'),
                    'order': overviewSectionGR.getDisplayValue('order'),
                    'hideSectionName': !!overviewSectionGR.hide_section_name,
                    'layout': overviewSectionGR.getValue('layout'),
                    'fields': [],
                };
            }

            if (sectionsList.length > 1) {
                // Block of code to retain the m2m order
                var indexMap = {};
                for (var i = 0; i < sectionsList.length; i++) {
                    indexMap[sectionsList[i]] = i;
                }
                overviewSectionIDs.sort(function(a, b) {
                    return indexMap[a] - indexMap[b];
                });
            }
            var overviewSectionFieldGR = new GlideRecord(this.OVERVIEW_SECTION_FIELD);
            overviewSectionFieldGR.addActiveQuery();
            overviewSectionFieldGR.addQuery('section', 'IN', overviewSectionIDs);
            overviewSectionFieldGR.orderBy('order');
            overviewSectionFieldGR.orderBy('field');
            overviewSectionFieldGR.query();

            var fieldVisibilityOptions = this._getFieldVisibilityCondition();

            while (overviewSectionFieldGR.next()) {
                var fieldName = overviewSectionFieldGR.getValue('field');
                var fieldVisibility = overviewSectionFieldGR.getValue('field_visibility');
                var overviewSectionFieldID = overviewSectionFieldGR.getUniqueValue();

                if (this._hasAccessToField(fieldName) && fieldVisibilityOptions.indexOf(fieldVisibility) > -1) {
                    if (fieldVisibility == 'user_criteria') {
                        var notAvailableFor = this.notAvailableForCriterias[overviewSectionFieldID];
                        if (!gs.nil(notAvailableFor) && sn_uc.UserCriteriaLoader.userMatches(this.loggedInUserSysId, notAvailableFor)) {
                            continue;
                        }

                        var availableFor = this.availableForCriterias[overviewSectionFieldID];
                        if (!gs.nil(availableFor) && !sn_uc.UserCriteriaLoader.userMatches(this.loggedInUserSysId, availableFor)) {
                            continue;
                        }
                    }

                    var fieldJSON = {
                        'sysId': overviewSectionFieldID,
                        'fieldLabel': employeeProfileGR.getElement(fieldName).getED().getLabel(),
                        'fieldType': employeeProfileGR.getElement(fieldName).getED().getInternalType(),
                        'fieldInternalValue': fieldName === 'user.manager' ? this.sysUserGR.getValue(fieldName.substring(5)) : employeeProfileGR.getValue(fieldName),
                        'fieldName': fieldName,
                        'fieldValue': employeeProfileGR.getDisplayValue(fieldName),
                        'order': overviewSectionFieldGR.getDisplayValue('order'),
                        'icon': overviewSectionFieldGR.getDisplayValue('icon'),
                        'ariaLabel': this._getFieldAriaLabel(fieldName, employeeProfileGR.getDisplayValue(fieldName))
                    };
                    if (this.editableFields[fieldName] && this.isLoggedInUserProfile) {
                        fieldJSON['isEditable'] = true;
                        fieldJSON['maxlength'] = this.editableFields[fieldName].maxlength;
                        fieldJSON['fieldType'] = this.editableFields[fieldName].fieldType;
                        if (fieldJSON['fieldType'] === 'choice') {
                            var choiceListArr = this.editableFields[fieldName].options;
                            var matchedIndex;
                            for (var choiceVar = 0; choiceVar < choiceListArr.length; choiceVar++) {
                                if (choiceListArr[choiceVar].label === fieldJSON.fieldValue)
                                    matchedIndex = choiceVar;
                            }
                            fieldJSON['choiceIndex'] = matchedIndex ? matchedIndex : 0;

                            fieldJSON['options'] = this.editableFields[fieldName].options;
                        }
                    }
                    var isUserSelectablePublicField = (this.userSelectablePublicFields.indexOf(fieldName) >= 0);
                    if (isUserSelectablePublicField)
                        fieldJSON['isPublic'] = this.isFieldPublic(fieldName);
                    if (!isUserSelectablePublicField || this.isLoggedInUserProfile || fieldJSON['isPublic'])
                        overviewSections[overviewSectionFieldGR.getValue('section')].fields.push(fieldJSON);
                }
            }

            overviewSectionIDs.forEach(function(sectionId) {
                if (overviewSections[sectionId].fields.length > 0) {
                    nonEmptySections.push(overviewSections[sectionId]);
                }
            });
        } else {
            gs.warn(gs.getMessage("[getOverviewSections] No sections were configured for this overview widget mapping instance - tabWidgetMapping: {0}", tabWidgetMapId));
        }
        return nonEmptySections;
    },

    /**
       Returns About Section and fields for Non-employee user.
	   returns {Array} Array of sections visible for Non-employee user
     */
    getNonEmployeeSections: function() {
        if (!this.sysUserGR.canRead()) {
            return [];
        }
        var sections = [];
        var nonEmployeeFields = [];
        var nonEmployeeFieldsOnUserProfile = ['title', 'email', 'department', 'manager', 'phone', 'mobile_phone'];
        var iconsArray = ['briefcase', 'envelope', 'cube', 'sitemap', 'phone', 'phone'];
        var nonEmployeeFieldLabels = [gs.getMessage('Title'), gs.getMessage('Email'), gs.getMessage('Department'), gs.getMessage('Manager'), gs.getMessage('Business phone'), gs.getMessage('Mobile phone')];

        for (var i = 0; i < nonEmployeeFieldsOnUserProfile.length; i++) {
            var fieldName = nonEmployeeFieldsOnUserProfile[i];
            if (!this.sysUserGR.getElement(fieldName).canRead()) {
                continue; // Skip fields that the user does not have access to
            }
            var fieldValue = this.sysUserGR.getDisplayValue(fieldName);
            var fieldJSON = {
                'sysId': gs.generateGUID(),
                'fieldName': fieldName,
                'fieldType': this.sysUserGR.getElement(fieldName).getED().getInternalType(),
                'fieldLabel': nonEmployeeFieldLabels[i],
                'fieldValue': fieldValue,
                'fieldInternalValue': this.sysUserGR.getValue(fieldName),
                'order': 100,
                'icon': iconsArray[i],
            };
            nonEmployeeFields.push(fieldJSON);
        }
        var aboutSection = {
            'sysId': gs.generateGUID(),
            'name': gs.getMessage('Work details'),
            'order': 100,
            'hideSectionName': false,
            'layout': 'two_column',
            'fields': nonEmployeeFields,
        };
        sections.push(aboutSection);
        return sections;
    },

    /**
       Returns field accessibility honoring field ACLs on User/HR profiles.
	   @param {String} fieldName: Current field name.
	   returns {Boolean} Field accessibility for logged in user
     */
    _hasAccessToField: function(fieldName) {
        /*if (this.employeeProfileGR.isValidField(fieldName)) {
            return true;
        }
        if (fieldName.startsWith('user.')) {
            return this.sysUserGR.getElement(fieldName.substring(5)).canRead();
        }
        if (fieldName.startsWith('hr_profile.') && !gs.nil(this.hrProfileGR)) {
            return this.hrProfileGR.getElement(fieldName.substring(11)).canRead();
        }
        return false;*/
        // added for fixing defect # DEF0268432
        return this.employeeProfileGR.getElement(fieldName).canRead();
    },

    /**
       Returns field visibility query string based on user id.
	   returns {String} Field visibility condition as a string
     */
    _getFieldVisibilityCondition: function() {
        var userId = this.employeeProfileGR.getValue('user');
        var fieldVisibilityQueryString = 'everyone,user_criteria';

        if (userId === this.loggedInUserSysId) { // If user viewing profile is employee itself
            fieldVisibilityQueryString += ',employee_only,employee_and_manager,emp_sec_mgrs_and_mgr';
        } else if (this.epUtils.userReportsTo(userId, this.loggedInUserSysId)) { // If user viewing profile is a manager of employee
            fieldVisibilityQueryString += ',employee_and_manager,manager_only,mgr_and_sec_mgrs,emp_sec_mgrs_and_mgr';
        } else if (this.epUtils.isloggedInUserSecondaryManager(userId, this.loggedInUserSysId)) { // If user viewing profile is a secondary manager of employee
            fieldVisibilityQueryString += ',mgr_and_sec_mgrs,emp_sec_mgrs_and_mgr';
        }
        return fieldVisibilityQueryString;
    },

    /*
       Returns required attributes for a specified employee
	   @param {GlideRecord} employeeProfileGR: GlideRecord of employee profile currently queried on.
	   returns {JSON} JSON of employee profile
    */
    getEmployeeProfileDetails: function() {
        var employeeProfileGr = this.employeeProfileGR;
        var firstName = employeeProfileGr.getDisplayValue("user.first_name") ? (employeeProfileGr.getDisplayValue("user.first_name").charAt(0)) : "";
        var lastName = employeeProfileGr.getDisplayValue("user.last_name") ? (employeeProfileGr.getDisplayValue("user.last_name").charAt(0)) : "";
        var profileDetails = {
            "name": employeeProfileGr.getDisplayValue("user") || "",
            "pronoun": (this.isLoggedInUserProfile || this.isFieldPublic("preferred_pronoun")) ? employeeProfileGr.getDisplayValue("preferred_pronoun") || "" : "",
            "role": employeeProfileGr.getDisplayValue("user.title") || "",
            "department": employeeProfileGr.getDisplayValue("user.department") || "",
            "background_banner": employeeProfileGr.getDisplayValue("background_banner") ? employeeProfileGr.getValue("background_banner") : "",
            "profile_id": employeeProfileGr.getUniqueValue() || "",
            "user_id": employeeProfileGr.getValue("user") || "",
            "initials": firstName + "" + lastName
        };
        return profileDetails;
    },

    /*
       Returns the live profile for a specified employee
	   @param {String} userID: userID of the user currently queried on.
	   returns {GlideRecord} GlideRecord of live profile visible to logged in user
    */
    getLiveProfileDetails: function(userID) {
        var liveProfileGr = new GlideRecord("live_profile");
        liveProfileGr.addEncodedQuery("document=" + userID + "^type=user");
        liveProfileGr.query();
        if (liveProfileGr.next() && liveProfileGr.canRead()) {
            return liveProfileGr;
        }
        return null;
    },
    /*
       Deletes the employee profile banner for a specified employee
       @param {String} userID: userID of the user currently queried on.
    */
    deleteEmployeeProfileBanner: function() {
        var userID = this.employeeProfileGR.getValue('user');
        var profileGr = new GlideRecord("sn_employee_profile");
        profileGr.addQuery("user", userID);
        profileGr.query();
        if (profileGr.next() && profileGr.canWrite()) {
            profileGr.setValue("background_banner", "");
            profileGr.update();
        }
    },

    /*
        Deletes the employee profile picture for a specified employee
        @param {String} userID: userID of the user currently queried on.
    */
    deleteEmployeeProfilePicture: function() {
        var profileGr = this.getLiveProfileDetails(data.sysUserID);
        if (profileGr) {
            profileGr.setValue("photo", "");
            profileGr.update();
        }
    },

    getChoiceFieldOptions: function(fieldName) {
        var options = [];
        var choiceList = GlideChoiceList.getChoiceList('sn_employee_profile', 'preferred_pronoun');
        for (var choiceVar = 0; choiceVar < choiceList.getSize(); choiceVar++) {
            var choice = choiceList.getChoice(choiceVar);
            var cLabel = choice.getLabel();
            var cValue = choice.getValue();
            var option = {
                'label': cLabel,
                'value': cValue
            }
            options.push(option);
        }
        return options;
    },
    /*
        Update the data when user edits the editable fields in Overview widget
    */
    updateEditableFields: function(field, value) {
        if (this.isLoggedInUserProfile && !!this.editableFields[field]) {
            this.employeeProfileGR.setValue(field, value);
            this.employeeProfileGR.update();
        } else {
            gs.info("The user does not have write access to the field");
        }
    },

    /*
    	Returns the default employee profile banner
    */
    getDefaultBackgroundBanner: function() {
        var image = '';
        var imageGr = new GlideRecord("db_image");
        imageGr.addQuery("sys_id", ep_Constants.defaultEmployeeProfileBanner);
        imageGr.addActiveQuery();
        imageGr.query();
        if (imageGr.next()) {
            image = imageGr.getDisplayValue("image") ? imageGr.getValue("image") : "";
        }
        return image;
    },
    /* 
    	Add or remove the field name to the user preference "employee_profile.public_fields" 
		@param {Boolean} makePublic: Input taken from user on Overview Widget under "Make it public"
    */
    updateUserPublicFieldPreference: function(fieldName, makePublic) {
        if (this.isLoggedInUserProfile && !!this.editableFields[fieldName]) {
            var preferenceValue = gs.getUser().getPreference(ep_Constants.PUBLIC_FIELD_USER_PREFERENCE);
            var publicFields = [];
            if (preferenceValue != null)
                publicFields = preferenceValue.split(',');
            if (makePublic && publicFields.indexOf(fieldName) < 0) {
                publicFields.push(fieldName);
                gs.getUser().savePreference(ep_Constants.PUBLIC_FIELD_USER_PREFERENCE, publicFields.toString());
            }
            if (!makePublic && publicFields.indexOf(fieldName) >= 0) {
                publicFields.splice(publicFields.indexOf(fieldName), 1);
                gs.getUser().savePreference(ep_Constants.PUBLIC_FIELD_USER_PREFERENCE, publicFields.toString());
            }
        }
    },
    /* 
    	Returns true if the user preference "employee_profile.public_fields" contains the given fieldName
    */
    isFieldPublic: function(fieldName) {
        var preferenceValue = '';
        if (this.isLoggedInUserProfile) {
            preferenceValue = gs.getUser().getPreference(ep_Constants.PUBLIC_FIELD_USER_PREFERENCE);
        } else {
            var userId = this.employeeProfileGR.getValue('user');
            var gr = new GlideRecord('sys_user_preference');
            gr.addQuery('name', ep_Constants.PUBLIC_FIELD_USER_PREFERENCE);
            gr.addQuery('user', userId);
            gr.query();
            if (gr.next()) {
                preferenceValue = gr.getValue('value');
            }
        }
        var publicFields = [];
        if (preferenceValue != null) {
            publicFields = preferenceValue.split(',');
        }
        return (publicFields.indexOf(fieldName) >= 0);
    },
    /*
        Returns the aria label of a field. 
        @param {String} fieldName: Name of the field"
        @param {String} fieledValue: Display value of the field"
    */
    _getFieldAriaLabel: function(fieldName, fieldValue) {
        if (fieldName === 'user.manager')
            return gs.getMessage('Open Profile: {0}', fieldValue);
        return fieldValue;
    },

    getUserNameWithFormat: function(profileGr, userFormat) {
        var fields = userFormat.split(".");
        var nameVal = [];
        var initials = "";
        fields.forEach(function(fieldName) {
            var val = profileGr.getDisplayValue("user." + fieldName);
            if (!gs.nil(val)) {
                nameVal.push(val);
                initials += val.charAt(0);
            }
        });
        var fullName = nameVal.join(" ");
        return {
            "fullName": fullName,
            "initials": this.getInitials(fullName) ? this.getInitials(fullName) : initials 
        };
    },

    /*
    	Returns initials of given name.
    	On global scope GlideNGInitials is defined, which is used across platform to get initials. As this is not available in scoped APIm, defining the same logic here. 
    	https://code.devsnc.com/dev/glide/blob/76f9f1a72028261edffb426cfabe433d49715fb4/glide/src.plugins/com/glide/ui/ng/NGInitials.java
    */
    getInitials: function(name) {

        try {
            if (!name || typeof name !== 'string' || name.trim() === '') {
                return '';
            }

            // (0) Remove non-word characters which are not { dot, space, parenthesis, double quote, square brackets }
            name = name.replace(/[^a-zA-Z0-9\s\(\)\[\]\"\.]/g, '');
            // (1) Remove everything wrapped in non-word characters like: David "Danger" Loo (NOW) -> David Loo
            name = name.replace(/[^a-zA-Z0-9\s\.][a-zA-Z0-9\s\.@]+[^a-zA-Z0-9\s\.]|[^a-zA-Z0-9\s\.]/g, '');
            // (2) Remove multiple spaces: David  Loo -> David Loo
            name = name.replace(/\s+/g, ' ');
            // (3) Remove leading and trailing spaces
            name = name.trim();
            // (4) Remove leading period characters
            name = name.replace(/^\.+/, '');
            // (5) Remove leftover spaces
            name = name.trim();

            if (name === '') {
                return '';
            }

            var firstInitial = '';
            var lastInitial = '';
            var nameParts = name.split(/[\s\.]/);

            // Check the first element of the array
            if (nameParts.length > 0 && nameParts[0].trim() !== '') {
                firstInitial = nameParts[0].charAt(0).toUpperCase();
            }

            // Check the last element of the array
            if (nameParts.length > 1 && nameParts[nameParts.length - 1].trim() !== '') {
                lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
            }

            return firstInitial + lastInitial;
        } catch (err) {
            gs.error(err);
            return "";
        }
    },

    getFieldValues: function(profileGr, fields) {
        var data = [];
        if (!gs.nil(fields)) {
            var finalFields = "";
            try {
                finalFields = fields.split(",");
                if (finalFields.length) {
                    finalFields.forEach(function(field) {
                        var val = profileGr.getDisplayValue(field);
                        if (!gs.nil(val)) {
                            var valObj = {
                                "fieldName": field,
                                "fieldLabel": profileGr.getElement(field).getLabel(),
                                "fieldValue": profileGr.getDisplayValue(field),
                                "fieldType": profileGr.getElement(field).getED().getInternalType()
                            };
                            data.push(valObj);
                        }
                    });
                }
            } catch (e) {
                gs.warn(gs.getMessage("[UserProfileConfig] Problem while processing fieldValues for user {0}", profileGr.getValue("user")));
                return data;
            }
            return data;
        }
        return data;
    },

    getUserProfileDetails: function(headerConfigData) {
        try {
            var employeeProfileGr = this.employeeProfileGR;
            var userNameValues = this.getUserNameWithFormat(employeeProfileGr, headerConfigData.userNameTemplate);
            return {
                "primaryInfo": {
                    "profileId": employeeProfileGr.getUniqueValue(),
                    "userNameValue": userNameValues.fullName,
                    "initials": userNameValues.initials,
                    "pronoun": (this.isLoggedInUserProfile || this.isFieldPublic("preferred_pronoun")) ? employeeProfileGr.getDisplayValue("preferred_pronoun") || "" : "",
                    "backgroundBanner": employeeProfileGr.getDisplayValue("background_banner") ? employeeProfileGr.getValue("background_banner") : "",
                },
                "secondaryInfo": {
                    "fields": this.getFieldValues(employeeProfileGr, headerConfigData.secondaryInfoFields),
                    "separator": "·"
                },
                "userPresenceInfo": {
                    "showPresence": gs.nil(headerConfigData.channel) ? false : headerConfigData.showPresence,
                    "channel": headerConfigData.channel
                }
            };
        } catch (err) {
            gs.error(err);
            return {};
        }
    },

    type: 'ep_portalUtilSNC'
};
