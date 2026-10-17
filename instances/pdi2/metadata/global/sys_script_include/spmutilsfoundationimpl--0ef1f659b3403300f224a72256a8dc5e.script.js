var SPMUtilsFoundationImpl = Class.create();
SPMUtilsFoundationImpl.prototype = {
    initialize: function() {
        this.PORTFOLIO_ADMIN = 'portfolio_admin';
        this.PORTFOLIO_EDITOR = 'portfolio_editor';
        this.PORTFOLIO_VIEWER = 'portfolio_viewer';
        this.SERVICE_ADMIN = 'service_admin';
        this.SERVICE_EDITOR = 'service_editor';
        this.SERVICE_VIEWER = 'service_viewer';
        this.SERVICE_AUTHOR = 'service_author';

        this.CMDB_CI_SERVICE = 'cmdb_ci_service';
        this.CMDB_CI_BUSINESS_SERVICE = 'cmdb_ci_service_business';
        this.CMDB_CI_TECHNICAL_SERVICE = 'cmdb_ci_service_technical';
        this.SERVICE_OFFERING = 'service_offering';
        this.SERVICE_OFFERING_COMMITMENT = 'service_offering_commitment';

        this.CMDB_REL_PERSON = 'cmdb_rel_person';
        this.CMDB_REL_GROUP = 'cmdb_rel_group';
        this.CMDB_REL_USER_TYPE_SERVICE_DELEGATE = '2a5b4f61b7df62105c5d2a16de11a9aa';
        this.CMDB_REL_GROUP_TYPE_SERVICE_DELEGATE = '4f5c1f21b7df62105c5d2a16de11a9ab';
        this.PUBLISHED_REF_FIELD = 'published_ref';

        this.DRAFT = 'draft';
        this.PUBLISHED = 'published';
        this.PUBLISHING = 'publishing';
        this.AWAITING_APPROVAL = 'awaiting_approval';

        this.arrayUtil = new ArrayUtil();
        this.currentUserId = gs.getUserID();
    },

    _getPublishedOrSelf: function(record) {
        if (!record || !record.isValidRecord())
            return record;

        if (!record.isValidField(this.PUBLISHED_REF_FIELD))
            return record;

        var publishedRef = record.getValue(this.PUBLISHED_REF_FIELD);
        if (gs.nil(publishedRef))
            return record;

        var publishedRecord = new GlideRecord(record.getTableName());
        if (publishedRecord.get(publishedRef))
            return publishedRecord;

        return record;
    },

    validateDelegateUser: function(record, options) {
        return this._validateDelegateRelation(record, {
            table: this.CMDB_REL_PERSON,
            typeId: this.CMDB_REL_USER_TYPE_SERVICE_DELEGATE,
            memberField: 'user',
            missingMemberMessage: gs.getMessage('Delegate user is required for this relationship.'),
            duplicateMessage: gs.getMessage('A delegate with this user already exists for this CI.'),
        }, options);
    },

    validateDelegateGroup: function(record, options) {
        return this._validateDelegateRelation(record, {
            table: this.CMDB_REL_GROUP,
            typeId: this.CMDB_REL_GROUP_TYPE_SERVICE_DELEGATE,
            memberField: 'group',
            missingMemberMessage: gs.getMessage('Delegate group is required for this relationship.'),
            duplicateMessage: gs.getMessage('A delegate group already exists for this CI.'),
        }, options);
    },

    _validateDelegateRelation: function(record, config, options) {
        var result = {
            isValid: true,
            message: '',
        };

        if (!record || !config) {
            result.isValid = false;
            result.message = gs.getMessage('Record validation configuration is required.');
            return result;
        }

        var ci = record.getValue('ci');
        if (gs.nil(ci)) {
            result.isValid = false;
            result.message = gs.getMessage('CI is required for this relationship.');
            return result;
        }

        var memberValue = record.getValue(config.memberField);
        if (gs.nil(memberValue)) {
            result.isValid = false;
            result.message = config.missingMemberMessage;
            return result;
        }

        var skipDuplicateCheck = options && options.skipDuplicateCheck;
        if (skipDuplicateCheck === true) {
            return result;
        }

        var excludeSysId = options && options.excludeSysId ? options.excludeSysId : '';
        var existing = new GlideRecord(config.table);
        existing.addQuery('ci', ci);
        existing.addQuery('type', config.typeId);
        existing.addQuery(config.memberField, memberValue);
        if (!gs.nil(excludeSysId)) {
            existing.addQuery('sys_id', '!=', excludeSysId);
        }
        existing.setLimit(1);
        existing.query();

        if (existing.next()) {
            result.isValid = false;
            result.message = config.duplicateMessage;
            return result;
        }

        return result;
    },

    canCurrentUserManageDelegate: function(record) {
        if (!record) {
            return false;
        }

        var tableName = typeof record.getTableName === 'function' ? record.getTableName() : '';
        if (tableName !== this.CMDB_REL_PERSON && tableName !== this.CMDB_REL_GROUP) {
            return true;
        }

        var requiredType = tableName === this.CMDB_REL_PERSON ? this.CMDB_REL_USER_TYPE_SERVICE_DELEGATE : this.CMDB_REL_GROUP_TYPE_SERVICE_DELEGATE;
        var typeValue = record.getValue('type');
        if (!gs.nil(typeValue) && typeValue !== requiredType) {
            return true;
        }

        var ciId = record.getValue('ci');
        if (gs.nil(ciId)) {
            return false;
        }

        return this._canCurrentUserManageDelegateForCi(ciId, tableName === this.CMDB_REL_PERSON);
    },

    _canCurrentUserManageDelegateForCi: function(ciId, isPersonRelation) {
        if (gs.hasRole(this.SERVICE_ADMIN)) {
            return true;
        }

        var context = this._resolveDelegateContext(ciId);
        if (!context || !context.service || !context.service.isValidRecord()) {
            return false;
        }

        var serviceGR = context.service;
        var ciGR = context.ci;

        if (serviceGR.getValue('owned_by') === this.currentUserId) {
            return true;
        }

        if (serviceGR.getValue('service_owner_delegate') === this.currentUserId) {
            return true;
        }

        if (this._isServiceDelegate(serviceGR)) {
            return true;
        }

        if (ciGR && ciGR.isValidRecord() && ciGR.sys_class_name && ciGR.sys_class_name.toString() === this.SERVICE_OFFERING) {
            if (this._isOfferingDelegate(ciGR)) {
                return true;
            }
        }

        return false;
    },

    /**
     * Resolves an input CI (service or offering) to the published record used for authorization.
     * Draft services/offerings map back to their published counterpart so delegate ACLs stay consistent.
     *
     * @param {string} ciId - Sys_id of the service or offering referenced by the delegate row.
     * @returns {{ci: GlideRecord, service: GlideRecord}|null} Draft-aware context for downstream checks.
     */
    _resolveDelegateContext: function(ciId) {
        if (gs.nil(ciId))
            return null;

        // Resolve CI from service or offering table, then fallback to published if applicable
        var ciGR = new GlideRecord(this.CMDB_CI_SERVICE);
        if (!ciGR.get(ciId)) {
            ciGR = new GlideRecord(this.SERVICE_OFFERING);
            if (!ciGR.get(ciId))
                return null;
        }

        // When the CI is a draft, resolve to its published counterpart so delegate lookups honor published delegates.
        var ciToCheck = this._getPublishedOrSelf(ciGR);

        // Determine service record to authorize against (offering -> parent service)
        var serviceGR = ciToCheck;
        if (ciToCheck.sys_class_name && ciToCheck.sys_class_name.toString() === this.SERVICE_OFFERING && ciToCheck.parent) {
            // Offerings authorize via their parent service; resolve that parent through the published record as well.
            var parentGR = ciToCheck.parent.getRefRecord();
            if (parentGR && parentGR.isValidRecord())
                serviceGR = this._getPublishedOrSelf(parentGR);
        }

        return {
            ci: ciToCheck,
            service: serviceGR,
        };
    },

    /* 
     * Returns true if the current user is owner, delegate of the offering.
     * Will return true even if the current user is a owner, delegate of parent service or an owner of a node in the hierarchy.
     * Else returns false.
     */
    checkOfferingAuthorization: function(offeringGR) {
        if (gs.hasRole(this.SERVICE_ADMIN))
            return true;

        if (gs.hasRole(this.SERVICE_AUTHOR)) {
            var isNew = (typeof offeringGR.isNewRecord === 'function') ? offeringGR.isNewRecord() : false;
            if (isNew)
                return true;

            var isCreator = offeringGR.sys_created_by.getValue() === gs.getUserName();
            if (isCreator)
                return true;
        }

        if (gs.hasRole(this.SERVICE_EDITOR)) {
            var isOwner = offeringGR.owned_by.getValue() === this.currentUserId;
            if (isOwner)
                return true;

            var isDelegateViaField = offeringGR.service_owner_delegate.getValue() === this.currentUserId;
            if (isDelegateViaField)
                return true;

            // For draft offerings, check delegates on the published offering instead
            // This ensures delegates maintain authorization on draft offerings during editing
            var offeringToCheck = this._getPublishedOrSelf(offeringGR);

            var isDelegateViaList = this._isOfferingDelegate(offeringToCheck);
            if (isDelegateViaList)
                return true;
        }

        // Fallback to parent service authorization if parent exists
        return this.checkServiceAuthorization(offeringGR.parent);
    },

    /* 
     * Returns true if the current user is owner, delegate of a service or an owner of a node in the hierarchy.
     * Else returns false.
     */
    checkServiceAuthorization: function(serviceGR) {
        if (gs.hasRole(this.SERVICE_ADMIN))
            return true;

        if (gs.hasRole(this.SERVICE_AUTHOR)) {
            var isNew = (typeof serviceGR.isNewRecord === 'function') ? serviceGR.isNewRecord() : false;
            if (isNew)
                return true;

            var isCreator = serviceGR.sys_created_by.getValue() === gs.getUserName();
            if (isCreator)
                return true;
        }

        if (gs.hasRole(this.SERVICE_EDITOR)) {
            var isOwner = serviceGR.owned_by.getValue() === this.currentUserId;

            if (isOwner)
                return true;

            var isDelegateViaField = serviceGR.service_owner_delegate.getValue() === this.currentUserId;
            if (isDelegateViaField)
                return true;

            // For draft services, check delegates on the published service instead
            // This ensures delegates maintain authorization on draft services during editing
            var serviceToCheck = this._getPublishedOrSelf(serviceGR);

            var isDelegateViaList = this._isServiceDelegate(serviceToCheck);
            if (isDelegateViaList)
                return true;
        }

        // Fallback to taxonomy node authorization if taxonomy node exists
        return this.checkTaxonomyNodeAuthorization(serviceGR.spm_taxonomy_node);
    },

    /**
     * Returns true if current user is a delegate (user or via group) of the given service
     */
    _isServiceDelegate: function(serviceGR) {
        if (!serviceGR)
            return false;

        // serviceGR can be a GlideRecord or a GlideElement
        var serviceId = (typeof serviceGR.getUniqueValue === 'function') ?
            serviceGR.getUniqueValue() :
            (typeof serviceGR.getValue === 'function' ? serviceGR.getValue() : '');

        if (!serviceId)
            return false;

        // Direct user delegate
        var delegateUserGR = new GlideRecord(this.CMDB_REL_PERSON);
        delegateUserGR.addQuery('ci', serviceId);
        delegateUserGR.addQuery('type', this.CMDB_REL_USER_TYPE_SERVICE_DELEGATE);
        delegateUserGR.addQuery('user', this.currentUserId);
        delegateUserGR.setLimit(1);
        delegateUserGR.query();

        if (delegateUserGR.hasNext())
            return true;

        // Group delegate (membership)
        var userGroupIds = this.arrayUtil.convertArray(gs.getUser().getMyGroups());

        if (!userGroupIds || userGroupIds.length === 0)
            return false;

        var delegateGroupGR = new GlideRecord(this.CMDB_REL_GROUP);
        delegateGroupGR.addQuery('ci', serviceId);
        delegateGroupGR.addQuery('type', this.CMDB_REL_GROUP_TYPE_SERVICE_DELEGATE);
        delegateGroupGR.addQuery('group', 'IN', userGroupIds);
        delegateGroupGR.setLimit(1);
        delegateGroupGR.query();

        if (delegateGroupGR.hasNext())
            return true;

        return false;
    },

    /**
     * Returns true if current user is a delegate (user or via group) of the given offering
     */
    _isOfferingDelegate: function(offeringGR) {
        if (!offeringGR)
            return false;

        // offeringGR can be a GlideRecord or a GlideElement
        var offeringId = (typeof offeringGR.getUniqueValue === 'function') ?
            offeringGR.getUniqueValue() :
            (typeof offeringGR.getValue === 'function' ? offeringGR.getValue() : '');

        if (!offeringId)
            return false;

        var serviceId = offeringGR.parent.getValue();

        // Build target IDs: offering and its parent service (if any)
        var targetIds = [];
        if (offeringId)
            targetIds.push(offeringId);

        if (serviceId)
            targetIds.push(serviceId);

        // Direct user delegate on offering or parent service
        var delegateUserGR = new GlideRecord(this.CMDB_REL_PERSON);
        delegateUserGR.addQuery('ci', 'IN', targetIds);
        delegateUserGR.addQuery('type', this.CMDB_REL_USER_TYPE_SERVICE_DELEGATE);
        delegateUserGR.addQuery('user', this.currentUserId);
        delegateUserGR.setLimit(1);
        delegateUserGR.query();

        if (delegateUserGR.hasNext())
            return true;

        // Group delegate (membership) on offering or parent service
        var userGroupIds = this.arrayUtil.convertArray(gs.getUser().getMyGroups());

        if (!userGroupIds || userGroupIds.length === 0)
            return false;

        var delegateGroupGR = new GlideRecord(this.CMDB_REL_GROUP);
        delegateGroupGR.addQuery('ci', 'IN', targetIds);
        delegateGroupGR.addQuery('type', this.CMDB_REL_GROUP_TYPE_SERVICE_DELEGATE);
        delegateGroupGR.addQuery('group', 'IN', userGroupIds);
        delegateGroupGR.setLimit(1);
        delegateGroupGR.query();

        if (delegateGroupGR.hasNext())
            return true;

        return false;
    },

    checkTaxonomyNodeAuthorization: function(taxonomyGr) {
        if (gs.hasRole(this.SERVICE_EDITOR)) {
            var isRoot = false;
            while (!isRoot) {
                if (taxonomyGr.taxonomy_node_owner.getValue() === this.currentUserId)
                    return true;

                var parentNode = new GlideRecord('spm_taxonomy_node');
                if (parentNode.get(taxonomyGr.parent.getValue()))
                    taxonomyGr = parentNode;
                else
                    isRoot = true;
            }
        }

        // Fallback to portfolio authorization if portfolio exists
        return this.checkPortfolioAuthorization(taxonomyGr.spm_service_portfolio);
    },

    checkPortfolioAuthorization: function(portfolioGr) {
        if (gs.hasRole(this.PORTFOLIO_ADMIN))
            return true;

        if (gs.hasRole(this.PORTFOLIO_EDITOR)) {
            var isOwner = portfolioGr.service_portfolio_owner.getValue() === this.currentUserId;
            return isOwner;
        }

        return false;
    },

    /* 
     * Given the type of a node and it's unique id, it returns 
     * if the current user is in the ownership hierarchy of the node
     */
    checkNodeOwnership: function(type, sys_id) {
        if (type == "taxonomy" || type == "leaf") {
            var taxonomy = new GlideRecord("spm_taxonomy_node");
            taxonomy.get(sys_id);
            return this.checkTaxonomyNodeAuthorization(taxonomy);
        } else if (type == "service") {
            var serviceGR = new GlideRecord("cmdb_ci_service");
            serviceGR.get(sys_id);
            return this.checkServiceAuthorization(serviceGR);
        } else if (type == "offering") {
            var offeringGR = new GlideRecord("service_offering");
            offeringGR.get(sys_id);
            return this.checkOfferingAuthorization(offeringGR);
        }
    },

    isValidPublishedService: function(service) {
        if (this.isValidService(service.sys_class_name) && this.isServicePublished(service)) {
            return true;
        }

        return false;
    },

    /*
     * Returns true if the service is supported in portfolio
     */
    isValidService: function(className) {
        if (className == this.CMDB_CI_SERVICE || className == this.CMDB_CI_BUSINESS_SERVICE || className == this.CMDB_CI_TECHNICAL_SERVICE)
            return true;

        return false;
    },

    /*
     * Returns true if the service is supported in portfolio
     */
    isValidServiceOrOffering: function(className) {
        if (className == this.SERVICE_OFFERING || this.isValidService(className))
            return true;

        return false;
    },

    /*
     * isServicePublished
     * returns true if service or offering is Published
     */
    isServicePublished: function(service) {
        if (service.state == '' || service.state == this.PUBLISHED)
            return true;
        return false;
    },

    /*
     * isServiceNew
     * returns true if service or offering is in draft state without published
     * item reference
     */
    isServiceNew: function(service) {
        if ((service.state == '' || service.state == this.DRAFT) && service.published_ref == '')
            return true;
        return false;
    },

    /*
     * didServicePublish
     * returns true if the service became published from draft state
     */
    didServicePublish: function(current, previous) {
        if ((previous.state == this.DRAFT || previous.state == this.PUBLISHING || previous.state == this.AWAITING_APPROVAL) && current.state == this.PUBLISHED && (previous.published_ref == current.sys_id || previous.published_ref == ''))
            return true;
        return false;
    },

    /*
     * callEvent
     * allows global SPM events to be called from scoped apps
     */
    callEvent: function(eventName, current, param1, param2, queue) {
        gs.eventQueue(eventName, current, param1, param2, queue);
    },

    /*
     * hasCommitments
     * returns true if record has any commitments in the commitments table
     */
    hasCommitments: function(recordId) {
        var commitments = new GlideRecord(this.SERVICE_OFFERING_COMMITMENT);
        commitments.addEncodedQuery('service_offering=' + GlideStringUtil.escapeQueryTermSeparator(recordId), true);
        commitments.query();

        return (commitments.getRowCount() > 0);
    },

    ifLegacyStatusMatches: function(table, record, portfolioStatus, serviceStatus) {
        var gr = new GlideRecord(table);
        gr.get(record.sys_id);

        var legacyStatuses = new global.LifeCycleUtil().findMatchingLifeCycleControl(table, gr, true);

        for (var i = 0; i < legacyStatuses.length; i++) {
            if (legacyStatuses[i].primaryCol === 'portfolio_status' && legacyStatuses[i].subCol === 'service_status')
                if ((!portfolioStatus || legacyStatuses[i].primaryValue === portfolioStatus) && (!serviceStatus || legacyStatuses[i].subValue === serviceStatus))
                    return true;
        }

        return false;
    },

    /**
     * Return lifecycle mappings associated with legacy/lifecycle values
     * @param {GlideRecord} gr service/offering 
     * @param {String} portfolioStatus 
     * @param {String} serviceStatus 
     * @param {String} lifecycleStage 
     * @param {String} lifecycleStageStatus 
     * @param {Number} recordLimit max number of records to return in query
     * @returns {GlideRecord}
     */
    _getLifeCycleMappings: function(gr, portfolioStatus, serviceStatus, lifecycleStage, lifecycleStageStatus, recordLimit) {
        function _getMappings(table) {
            var gr = new GlideRecord('life_cycle_mapping');
            gr.addEncodedQuery('table=' + GlideStringUtil.escapeQueryTermSeparator(table), false);
            gr.addQuery('legacy_field_name', 'portfolio_status');
            gr.addQuery('legacy_subfield_name', 'service_status');

            if (portfolioStatus)
                gr.addEncodedQuery('legacy_field_value=' + GlideStringUtil.escapeQueryTermSeparator(portfolioStatus), false);
            else if (lifecycleStage)
                gr.addEncodedQuery('life_cycle_control.life_cycle_stage=' + GlideStringUtil.escapeQueryTermSeparator(lifecycleStage), false);

            if (serviceStatus)
                gr.addEncodedQuery('legacy_subfield_value=' + GlideStringUtil.escapeQueryTermSeparator(serviceStatus), false);
            else if (lifecycleStageStatus)
                gr.addEncodedQuery('life_cycle_control.life_cycle_stage_status=' + GlideStringUtil.escapeQueryTermSeparator(lifecycleStageStatus), false);

            if (recordLimit && typeof recordLimit == 'number')
                gr.setLimit(recordLimit);

            gr.query();
            return gr;
        }

        var mappings = null;
        if (!(gr || gr.isValidRecord()))
            return mappings;

        // try to get mappings directly tied to record table
        mappings = _getMappings(gr.getValue('sys_class_name'));

        if (!mappings.hasNext() && gr.getValue('sys_class_name') == this.SERVICE_OFFERING && gr.parent && gr.parent.sys_class_name)
            // if there are no mappings, and the record is an offering, try the parent service table
            mappings = _getMappings(gr.parent.sys_class_name.toString());
        else if (!mappings.hasNext())
            // lastly, try the cmdb_ci_service table
            mappings = _getMappings('cmdb_ci_service');

        return mappings;
    },

    getLifeCycleStage: function(ci, portfolioStatus, serviceStatus) {
        var mapping = this._getLifeCycleMappings(ci, portfolioStatus, serviceStatus, null, null, 1);
        if (mapping && mapping.next() && mapping.life_cycle_control)
            return mapping.life_cycle_control.life_cycle_stage;
        return false;
    },

    /**
     * Return the lifecycle mappings associated with a phase (portfolio_status) 
     * @param {GlideRecord} ci - offering/business service/technical service
     * @param {String} portfolioStatus 
     * @returns {Boolean}
     */
    getLifeCycleStages: function(ci, portfolioStatus) {
        var mappingsObj = null;

        var mappings = this._getLifeCycleMappings(ci, portfolioStatus, null, null, null, null);
        while (mappings.next()) {
            if (!mappingsObj)
                mappingsObj = {};

            if (mappings.life_cycle_control) {
                var lifecycleStage = mappings.life_cycle_control.life_cycle_stage;
                var lifecycleStageStatus = mappings.life_cycle_control.life_cycle_stage_status;

                if (!lifecycleStage || !lifecycleStageStatus) {
                    continue;
                } else {
                    lifecycleStage = lifecycleStage.toString();
                    lifecycleStageStatus = lifecycleStageStatus.toString();
                }

                if (!mappingsObj[lifecycleStage])
                    mappingsObj[lifecycleStage] = [];

                mappingsObj[lifecycleStage].push(lifecycleStageStatus);
            }
        }

        return mappingsObj;
    },

    getLifeCycleStageStatus: function(ci, portfolioStatus, serviceStatus) {
        var mapping = this._getLifeCycleMappings(ci, portfolioStatus, serviceStatus, null, null, 1);
        if (mapping && mapping.next() && mapping.life_cycle_control)
            return mapping.life_cycle_control.life_cycle_stage_status;
        return false;
    },

    lifeCycleStageChangesFrom: function(current, previous, portfolioStatus, serviceStatus) {
        if (current.life_cycle_stage_status.changes()) {
            var status = this.ifLegacyStatusMatches(current.sys_class_name, previous, portfolioStatus, serviceStatus);
            return status;
        } else if (current.service_status.changes()) {
            return true;
        }

        return false;
    },

    /**
     * Function that lifecycle stage values (for Service Portfolio)
     */
    lifeCycleStageForPortfolio: function(current) {
        // Ideation, Operational, End of Life
        return 'sys_idIN70d7c2d840321010f8770d4223eb083a,53584655b7620010ee0d3177ee11a97f,6cc34291b7620010ee0d3177ee11a9f8^EQ';
    },

    /**
     * Function that lifecycle stage values (for Taxonomy Node)
     */
    lifeCycleStageForNode: function(current) {
        return this.lifeCycleStageForPortfolio(current);
    },

    /**
     * Function that returns conditional values depending on lifecycle stage status value (for Service Portfolio)
     */
    lifeCycleStageStatusForPortfolio: function(current) {
        var stageValue = current.life_cycle_stage;
        if (!stageValue) {
            gs.error('Could not get lifecycle stage value');
            return '';
        }
        stageValue = stageValue.getRefRecord();
        if (!stageValue.isValidRecord()) {
            gs.error('Invalid lifecycle stage record');
            return '';
        }
        stageValue = stageValue.sys_id;
        var ideationState = '70d7c2d840321010f8770d4223eb083a'; // Ideation
        // Contains (in order): 'Draft', 'Under Evaluation'
        var ideationStateStages = ['e99a231773ba10109cc5aa114df6a7fc', 'e3f706d840321010f8770d4223eb08da'];
        var operationalState = '53584655b7620010ee0d3177ee11a97f'; // Operational
        // Contains (in order): 'In Use', 'Published', 'Pending Retirement'
        var operationalStateStages = ['e4990295b7620010ee0d3177ee11a9db', '09aaa31773ba10109cc5aa114df6a78c', '12afc659b7620010ee0d3177ee11a9d6'];
        var endOfLifeState = '6cc34291b7620010ee0d3177ee11a9f8'; // End of Life
        // Contains (in order): 'Retired', 'Cancelled'
        var endOfLifeStateStages = ['b4e8ca55b7620010ee0d3177ee11a95a', 'b58a631773ba10109cc5aa114df6a762'];
        var queryString = 'sys_idIN';
        if (stageValue == ideationState)
            return queryString + ideationStateStages.join(',');
        else if (stageValue == operationalState)
            return queryString + operationalStateStages.join(',');
        else if (stageValue == endOfLifeState)
            return queryString + endOfLifeStateStages.join(',');
        else
            return queryString;
    },

    /**
     * Function that returns conditional values depending on lifecycle stage status value (for Taxonomy Node)
     */
    lifeCycleStageStatusForNode: function(current) {
        return this.lifeCycleStageStatusForPortfolio(current);
    },

    /**
     * Check if draft version of a service is in "operational" service status
     * @param {String | GlideRecord} service
     * @return {Boolean}
     */
    isDraftServiceOperational: function(service) {
        // if service builder is not activated, no draft services should exist, so return false
        if (!GlidePluginManager.isActive('com.snc.service_builder'))
            return false;

        var SERVICE_STATUS_OPERATIONAL = 'operational';
        var PORTFOLIO_STATUS_CATALOG = 'catalog';
        var asbUtils = new sn_service_builder.ASBUtils();

        var serviceGr = null;
        if (typeof service == 'string')
            serviceGr = asbUtils.getNodeOfAnyType(service);
        else if (Boolean(service) && Boolean(service.isValidRecord()))
            serviceGr = service;

        if (Boolean(serviceGr) == false)
            return false;

        var draftServiceGr = asbUtils.getDraftRecord(serviceGr);
        if (Boolean(draftServiceGr) == false || Boolean(draftServiceGr.isValidRecord()) == false)
            return false;
        else if (GlidePluginManager.isActive('com.snc.cmdb.csdm.activation') && draftServiceGr.getValue('life_cycle_stage_status') == this.getLifeCycleStageStatus(draftServiceGr, PORTFOLIO_STATUS_CATALOG, SERVICE_STATUS_OPERATIONAL))
            return true;
        else if (draftServiceGr.getValue('service_status') == SERVICE_STATUS_OPERATIONAL)
            return true;

        return false;
    },

    /**
     * Based on a portfolio_status value, verify if the lifecycle fields of a record are equivalent to a portfolio_status
     * @param {GlideRecord} serviceGr 
     * @param {String} portfolioStatus 
     * @returns {Boolean}
     */
    matchPortfolioStatusToLifecycleMappings: function(serviceGr, portfolioStatus) {
        var mappings = this.getLifeCycleStages(serviceGr, portfolioStatus);
        var grLifecycleStage = serviceGr.getValue('life_cycle_stage');
        var grLifecycleStageStatus = serviceGr.getValue('life_cycle_stage_status');

        if (!mappings || !grLifecycleStage || !grLifecycleStageStatus)
            return false;

        // Given the current lifecycle stage and stage status of the service
        // check if there is a lifecycle mapping equivalent to the portfolio_status
        if (mappings[grLifecycleStage] && mappings[grLifecycleStage].indexOf(grLifecycleStageStatus) >= 0)
            return true;

        return false;
    },

    /**
     * Return message for incorrect legacy/lifecycle choice change 
     * @param {GlideRecord} gr service/offering
     * @param {String} fieldName
     * @returns {String}
     */
    generateConstraintMsg: function(gr, fieldName) {
        var status, retiring, retired, obsolete, operational = null;

        if (fieldName == 'life_cycle_stage_status') {
            status = gr.life_cycle_stage_status.getED().getLabel();
            retiring = this.getLifeCycleStageStatus(gr, 'catalog', 'retiring').toString();
            retired = this.getLifeCycleStageStatus(gr, 'retired', 'retired').toString();
            obsolete = this.getLifeCycleStageStatus(gr, 'retired', 'obsolete').toString();
            operational = this.getLifeCycleStageStatus(gr, 'catalog', 'operational').toString();
        } else {
            // retrieve values from legacy field
            status = gr.service_status.getED().getLabel();
            var serviceStatusChoices = new GlideChoiceList().getChoiceList('cmdb_ci_service', 'service_status');
            retiring = serviceStatusChoices.getChoice('retiring').getLabel();
            retired = serviceStatusChoices.getChoice('retired').getLabel();
            obsolete = serviceStatusChoices.getChoice('obsolete').getLabel();
            operational = serviceStatusChoices.getChoice('operational').getLabel();
        }
        var lifeCycleLabels = [];
        if (retiring)
            lifeCycleLabels.push(retiring);
        if (retired)
            lifeCycleLabels.push(retired);
        if (obsolete)
            lifeCycleLabels.push(obsolete);

        var labelString = lifeCycleLabels.join(gs.getMessage(' or '));

        return gs.getMessage('{0} can only move forward to {1} from {2}.', [status, labelString, operational]);
    },

    /**
     * Check if a service has offerings, and if it does not, generate the appropriate message
     * @param {GlideRecord} service 
     * @param {String} fieldName 
     * @param {String} fieldDisplayValue 
     * @returns {Object}
     */
    verifyOfferingOnService: function(serviceGr, fieldName, fieldDisplayValue) {
        var retObj = {
            hasOffering: true,
            msg: ''
        };

        var offering = new GlideAggregate('service_offering');
        var grQuery = offering.addQuery('parent', serviceGr.getValue('sys_id'));
        if (serviceGr.getValue('published_ref'))
            grQuery.addOrCondition('parent', serviceGr.getValue('published_ref'));

        offering.addAggregate('COUNT');
        offering.query();

        if (offering.next() && offering.getAggregate('COUNT') == 0) {
            retObj.hasOffering = false;

            if (fieldName == 'life_cycle_stage')
                retObj.msg = gs.getMessage('A service cannot move to a {0} {1} unless it has least one offering.', [fieldDisplayValue, serviceGr.life_cycle_stage.getED().getLabel().toLowerCase()]);
            else if (fieldName == 'portfolio_status')
                retObj.msg = gs.getMessage('A service cannot move to a {0} {1} unless it has least one offering.', [fieldDisplayValue, serviceGr.portfolio_status.getED().getLabel().toLowerCase()]);
        }

        return retObj;
    },

    type: 'SPMUtilsFoundationImpl'
};
