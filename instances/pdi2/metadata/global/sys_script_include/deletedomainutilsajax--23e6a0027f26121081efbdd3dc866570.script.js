var DeleteDomainUtilsAjax = Class.create();
DeleteDomainUtilsAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    /**
     * This script include provides the client-callable utility methods for deleting data by domains. It includes methods for slushbucket for deleting domains in Inactive Domains UI Page, Preview and Staging of Domain Data
     */
    LEFT_SLUSH_END_MARKER: '==END==',

    /**
     * This function is used to set the values in left and right side of the slushbucket as per the selection.
     * @param selectedDomains - List of selected inactive domains
     * @param prefix - Prefix to filter the available inactive domain names
     */
    setItemWithTableData: function() {
        var prefix = this.getParameter('sysparm_prefix');
        var rightChoiceMap = {};
        var leftChoiceMap = {};
        var selectedDomains = [];
        if (prefix) {
            var rightValues = this.getParameter('sysparm_right_choice_values');
            if (!rightValues) {
                rightValues = '';
            }
            var arr = rightValues.split(',');
            for (var x in arr) {
                rightChoiceMap[arr[x]] = true;
            }
        } else {
            var domainGr = new GlideRecordSecure('domain_cleanup_queue');
            domainGr.addQuery('state', 'ready_for_staging');
            domainGr.query();
            while (domainGr.next()) {
                rightChoiceMap[domainGr.getValue('domain')] = domainGr.domain.name.toString();
            }
        }
        selectedDomains = Object.keys(rightChoiceMap);
        this.getLeftSlushRecords(leftChoiceMap, selectedDomains, prefix);
        this.populateSlushLeftRightValues(leftChoiceMap, rightChoiceMap);
    },

    /**
     * This function is used to save the selected inactive domains in domain_cleanup_queue table.
     */
    saveSlushbucketPreferences: function() {
        var response = {};
        var rightValues = this.getParameter('sysparm_right_choice_values');
        if (!rightValues) {
            rightValues = '';
        }
        var jsRightValues = j2js(rightValues);
        var rightValuesArray = jsRightValues.split(',');
        this.insertSlushbucketSelection(rightValuesArray);
        response.status = 'success';
        return JSON.stringify(response);
    },

    /**
     * This function is used to insert the selected inactive domains in domain_cleanup_queue table.
     * @param inactiveDomains - List of selected inactive domains in right side of the slushbucket
     */
    insertSlushbucketSelection: function(inactiveDomains) {
        if (inactiveDomains.length == 0) {
            return;
        }
        var existingInactiveDomains = this.getSelectedInactiveDomains();
        var domainsToDelete = [];
        var domainsToAdd = [];
        for (var i = 0; i < existingInactiveDomains.length; i++) {
            if (!inactiveDomains.includes(existingInactiveDomains[i]))
                domainsToDelete.push(existingInactiveDomains[i]);
        }
        for (var j = 0; j < inactiveDomains.length; j++) {
            if (inactiveDomains[j] && !existingInactiveDomains.includes(inactiveDomains[j]))
                domainsToAdd.push(inactiveDomains[j]);
        }
        this.deleteInactiveDomains(domainsToDelete);
        this.addInactiveDomains(domainsToAdd);
    },

    /**
     * This function is used to get the list of existing inactive domains which ain't staged.
     * @returns {Array} - List of selected inactive domains
     */
    getSelectedInactiveDomains: function() {
        var existingValues = [];
        var domainGr = new GlideRecordSecure('domain_cleanup_queue');
        domainGr.addQuery('state', 'ready_for_staging');
        domainGr.query();
        while (domainGr.next()) {
            existingValues.push(domainGr.getValue('domain'));
        }
        return existingValues;
    },

    /**
     * This function removes the domains that have been moved from right to left (unselected)
     * from the domain_cleanup_queue table.
     */
    deleteInactiveDomains: function(domainsToDelete) {
        if (!domainsToDelete || domainsToDelete.length == 0)
            return;
        var gr = new GlideRecordSecure('domain_cleanup_queue');
        gr.addQuery('domain', "IN", domainsToDelete.join(','));
        gr.addQuery('state', 'ready_for_staging');
        gr.query();
        gr.deleteMultiple();
    },

    addInactiveDomains: function(domainsToAdd) {
        var gr = new GlideRecordSecure('domain_cleanup_queue');
        for (var i = 0; i < domainsToAdd.length; i++) {
            gr.initialize();
            gr.setValue('domain', domainsToAdd[i]);
            gr.setValue('state', 'ready_for_staging');
            gr.insert();
        }
    },

    /**
     * This function is used to get the list of inactive domains which are in the lowest level in domain hierarchy and are to be displayed in the left side of the slushbucket.
     * @param leftChoiceMap - Map of inactive domains which are not selected
     * @param selectedDomains - List of selected inactive domains
     * @param prefix - Prefix to filter the available inactive domain names
     */
    getLeftSlushRecords: function(leftChoiceMap, selectedDomains, prefix) {
        var stagingDomainSysId = '6f9530c8ff1712104debffffffffffff';
        var domainGr = new GlideRecordSecure(GlideDomainSupport.getDomainTable());
        var domainHierarchy = GlideDomainTree.get();
        if (selectedDomains) {
            domainGr.addQuery('sys_id', 'NOT IN', selectedDomains);
        }
        if (prefix) {
            domainGr.addQuery('name', 'STARTSWITH', prefix);
        }
        domainGr.addQuery('active', false);
        var parentQuery = domainGr.addQuery('parent', '!=', stagingDomainSysId);
        parentQuery.addOrCondition('parent', null);
        domainGr.query();

        while (domainGr.next()) {
            var inactiveDomain = domainHierarchy.get(domainGr.getUniqueValue());
            if (GlideDomainSupport.isLeafDomain(inactiveDomain)) {
                leftChoiceMap[domainGr.getUniqueValue()] = domainGr.name.toString();
            }
        }
    },

    /**
     * This function is used to populate the left and right side of the slushbucket.
     * @param leftSlushRecords - List of inactive domains which are not selected
     * @param rightChoiceMap - Map of selected inactive domains
     */
    populateSlushLeftRightValues: function(leftChoiceMap, rightChoiceMap) {
        var item;
        var leftChoiceMapKeys = Object.keys(leftChoiceMap);
        for (var j = 0; j < leftChoiceMapKeys.length; j++) {
            if (!rightChoiceMap[leftChoiceMapKeys[j]]) {
                item = this.newItem();
                item.setAttribute('value', leftChoiceMapKeys[j]);
                item.setAttribute('text', leftChoiceMap[leftChoiceMapKeys[j]]);
            }
        }

        item = this.newItem();
        item.setAttribute('value', this.LEFT_SLUSH_END_MARKER);
        var keys = Object.keys(rightChoiceMap);
        for (var i = 0; i < keys.length; i++) {
            item = this.newItem();
            item.setAttribute('value', keys[i]);
            item.setAttribute('text', rightChoiceMap[keys[i]]);
        }
    },

    ensureMaxDomainsToStaging: function() {
        var gr = new GlideRecordSecure('domain_cleanup_queue');
        gr.addQuery('state', 'ready_for_staging');
        gr.query();
        var count = gr.getRowCount();

        // a check for a maximum limit
        if (count > 20) {
            return JSON.stringify({
                success: false,
                message: 'You can only transfer up to 20 domains to staging at a time.'
            });
        } else {
            return JSON.stringify({
                success: true,
                message: 'Domains can be moved to staging.'
            });
        }
    },

    /**
     * Ensures that a new batch can be staged only if no other batch already exists with the same planned deletion date.
     */
    plannedDeletionDateOverlapping: function() {
        var stagingRetentionDays = parseInt(this.getParameter('sysparm_staging_retention_days'), 10);
        var plannedDeletionDate = new GlideDateTime();
        plannedDeletionDate.addDays(stagingRetentionDays);
        var plannedDateStr = plannedDeletionDate.getDisplayValue().substring(0, 10); // Extract YYYY-MM-DD

        var startOfDay = new GlideDateTime(plannedDateStr + " 00:00:00");
        var endOfDay = new GlideDateTime(plannedDateStr + " 23:59:59");

        var gr = new GlideRecordSecure('domain_cleanup_queue');
        gr.addQuery('state', 'staged_and_deletion_planned');
        gr.addQuery('planned_deletion_date', '>=', startOfDay);
        gr.addQuery('planned_deletion_date', '<=', endOfDay);
        gr.query();
        var result = {
            success: gr.hasNext(),
            message: ''
        };
        return JSON.stringify(result);
    },

    /**
     * Populate inactive_domain_data table with table name and record count for each domain_cleanup_queue record which is staged for deletion
     */
    populateInactiveDomainsStagedForDeletion: function() {
        var domainCleanup = new SNC.DomainCleanup();
        if (domainCleanup.schedulePopulateInactiveDomainJob() != null) {
            return JSON.stringify({
                success: true,
                message: ''
            });
        } else {
            return JSON.stringify({
                success: false,
                message: ''
            });
        }
    },

    type: 'DeleteDomainsUtils'
});
