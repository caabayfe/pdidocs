/**
 * Mechanism to look at an acl record and classifiy it into an enumerated type used for further analysis.
 * Note that this does not return multiple attributes, just a single classification.
 */
var AclAnalyzer = Class.create();
AclAnalyzer.prototype = {
    // enumeration of ACL types
    ACL_NOOP: 'n',
    ACL_UNRESTRICTED: 'u',
    ACL_RESTRICTED: 'r',
    ACL_USER_RESTRICTED: 'ur',
    ACL_APPROVER_RESTRICTED: 'a',
    ACL_UNKNOWN: 'ukn',

    initialize: function(arrayUtil) {
        this.arrayUtil = arrayUtil ? arrayUtil : new global.LicensingScriptUtil();
    },

    /**
     * getAclTypes
     * @returns {array} array of all enumerated ACL types
     */
    getAclTypes: function() {
        return [this.ACL_UNRESTRICTED, this.ACL_RESTRICTED, this.ACL_APPROVER_RESTRICTED, this.ACL_USER_RESTRICTED, this.ACL_UNKNOWN, this.ACL_NOOP];
    },

    /**
     * getACLType
     * Determine the ACL type for the ACL record in specified aclRecordIterator based on the condition and script
     * @param {object} aclRecordIterator
     * @returns {string} value from ACL type enumeration
     */
    getACLType: function (aclRecordIterator) {
        var conditionStr = aclRecordIterator.getCondition();
        var scriptStr = this._removeComments(aclRecordIterator.getScript());

        var aclType;
        if (this._isNoOpCondition(scriptStr)) {
            aclType = this.ACL_NOOP;
        } else if (this._isKnownUnknownCondition(scriptStr)) {
            aclType = this.ACL_UNKNOWN;
        } else if (gs.nil(conditionStr) && gs.nil(scriptStr)) {
            aclType = this.ACL_UNRESTRICTED;
        } else if (this._containsCondition(true, conditionStr) || this._containsCondition(true, scriptStr)) {
            aclType = this.ACL_APPROVER_RESTRICTED;
        } else if (this._containsCondition(false, conditionStr) || this._containsCondition(false, scriptStr)) {
            aclType = this.ACL_USER_RESTRICTED;
        } else {
            aclType = this.ACL_RESTRICTED;
        }
        return aclType;
    },

    /**
     * getACLScriptAttributes
     * Return digested attrbutes of the script in ACL record in specified aclRecordIterator which can be used
     * to make finer grained decisions about ACL type
     * @param {object} aclRecordIterator
     * @returns {object}
     */
    getACLScriptAttributes: function (aclRecordIterator) {
        var scriptStr = aclRecordIterator.getScript();
        var hasComment = scriptStr.includes('/*');
        scriptStr = this._removeComments(scriptStr);

        return {
            'hasClass': scriptStr.includes(' new '),
            'hasComment': hasComment,
            'hasHasRole': scriptStr.includes('hasRole'),
            'hasCanRead': scriptStr.includes('.canRead('),
            'hasCanWrite': scriptStr.includes('.canWrite('),
            'hasIf': scriptStr.includes('if(') || scriptStr.includes('if (') ,
            'hasOr': scriptStr.includes('||'),
            'hasIsMemberOf': scriptStr.includes('isMemberOf')
        }
    },

    /**
     * _isNoOpCondition
     * Check the string to identify no op operations.
     * @param {string} str
     * @returns boolean
     */
    _isNoOpCondition: function (str) {
        str = str.replace(/\s/g,"");
        var noop = [];
        noop.push("answer=false;");
        noop.push("false;");
        noop.push("answer=false");
        noop.push("0;");
        return this.arrayUtil.contains(noop, str);
    },


    /**
     * _isKnownUnknownCondition
     * Identify conditions that have common patterns but are not cleary identifable and need to be ignored
     * @param {*} str
     */
    _isKnownUnknownCondition: function (str) {
        return str.match(/current\.\S*can(Write|Read)\(\)/g);
    },

    /**
    * _containsUserCondition
    * Identify if the string (condition or string) contains some user identifying code
    * @param {string} isApprover true if approver, false if user
    * @param {string} scriptString The condition to look at
    * @returns boolean Is the string contains some user identifying code
    */
    _containsCondition: function (isApprover, scriptString) {
        var conditions = [];
        var notIdentifying = [];

        if (isApprover) {
            conditions.push('ApproverUtils()');
        } else {
            // covers several variations of this
            conditions.push('gs.getUser');
            conditions.push('gs.user_id()'); // only global, deprecated by getUserId but still used
            conditions.push('gs.userid()'); // only global, deprecated by getUserId but still used
            // CSM
            conditions.push('sn_queryrules'); // CSM Security
            conditions.push('CSMProjectManagementSecurityUtil'); // CSM PPM

            // SPM
            conditions.push('IMIdeaAccessHelper()'); // ITBM Security

            // Platform
            conditions.push('VTBTaskSecurity'); // VTB security
            conditions.push('sn_cd.cd_ContentDelegationUtils()');

            // Uses User Criteria which may be fulfiller but also can be customized based on user so leaving it as requester
            conditions.push('new STTRMModel(current).evaluateWriteSecurity()');
            conditions.push('new STTRMModel(current).evaluateReadSecurity()');

            // PSM
            conditions.push('new SpendTaskControls(current).canShopperReadAcknowledgementTask();');
            conditions.push('new SpendTaskControls(current).canShopperWriteAcknowledgementTask();');
            conditions.push('SpendCommonUtil.getMyShoppingAs');
            conditions.push('getShopAsUser');
            conditions.push('canShopperReadPurchasingTask');
            conditions.push('canShopperViewApprovalPlan');
            conditions.push('canShopperWritePurchasingTaskState');
            conditions.push('canShopperWriteApprovalPlan');
            conditions.push('canShopperWritePurchasingTaskComments');

            // HR
            conditions.push('er_SecurityUtils().hasReadAccess'); // HR Request

            // Legal

            // Unknown
            conditions.push('AgentScheduleUtil'); //
        }

        // generic
        notIdentifying.push('assigned_to'); // if the script is looking at the assigned to, we are assuming the is fulfilling
        notIdentifying.push('assignment_group'); // if the script is looking at the assignment group, we are assuming the is fulfilling

        // CSM
        notIdentifying.push('QueryRuleGenerator().getEncodedQueryForRoles');
        // SPM
        notIdentifying.push('PPMRoleClassMapper.validateAccess('); // SPM's filter for TeamSpaces
        // Legal
        notIdentifying.push('LegalOperationsSecurity().hasRoleExactly'); // used for legal to block
        // notIdentifying.push('additional_assignee_list'); // if the script is looking at the assigned to, we are assuming the is fulfilling // used by LSD but always is paired with assigned_to so this may not be needed


        for (var nc in notIdentifying) {
            // if the condition has what we are looking for, return early since we don't have to look for more.
            if (scriptString.includes(notIdentifying[nc])) {
                return false;
            }
        }

        for (var c in conditions) {
            // if the condition has what we are looking for, return early since we don't have to look for more.
            if (scriptString.includes(conditions[c])) {
                return true;
            }
        }

        // Special cases
        if (scriptString.includes('current.parent') && scriptString.includes('.canRead()')) {
            // Checking the parent of the task for access.  This won't be a driving record since hte parent record will identify the role type so we'll ignore these.
            return true;
        }

        // check for dynamic filters
        var dynamicFilters = this._findDynamicFilters(scriptString);
        // if we didn't find any we are done looking
        if (dynamicFilters.length == 0)
            return false;

        // check if this filter has a non-identifying query
        if (this._findMatchingDynamicFilter(dynamicFilters, notIdentifying))
            return false;

        // check if this filter does something with the user
        // we may want to add more here in the future
        return this._findMatchingDynamicFilter(dynamicFilters, conditions);
    },

    /**
     * Return list of references to a dynamic filter in specified script string
     * @param {string} scriptString
     */
    _findDynamicFilters: function(scriptString) {
        // check for dynamic filters
        var dynamicFilterOptions = [];
        var regex = /DYNAMIC([a-f0-9]{32})/gm;
        var m;

        // loop through matches to find dynamic filters
        while ((m = regex.exec(scriptString)) !== null) {
            if (m.length == 2)
                dynamicFilterOptions.push(m[1]);
        }

        return this.arrayUtil.unique(dynamicFilterOptions);
    },

    _findMatchingDynamicFilter: function(dynamicFilters, conditions) {
        var filterGr = new GlideRecord('sys_filter_option_dynamic');
        filterGr.addQuery('sys_id', 'IN', dynamicFilters);
        var conditionsCause;
        for (var key in conditions) {
            if (!conditionsCause) {
                conditionsCause = filterGr.addQuery('script', 'CONTAINS', conditions[key]);
            } else {
                conditionsCause.addOrCondition('script', 'CONTAINS', conditions[key]);
            }
        }
        filterGr.query();
        return filterGr.hasNext()
    },

    /**
     * removeComments
     * Remove comments from a string
     * @param {string} str 
     * @returns sanitized input
     */
    _removeComments: function (str) {
        return str.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,'');
    },    

    type: 'AclAnalyzer'
};
