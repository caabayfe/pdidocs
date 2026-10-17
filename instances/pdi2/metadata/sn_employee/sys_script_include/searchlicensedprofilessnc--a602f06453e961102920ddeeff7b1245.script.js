var searchLicensedProfilesSNC = Class.create();
searchLicensedProfilesSNC.prototype = {
    initialize: function() {
    },

    /* Search for all users that are licensed for a specific application
     * @param payload {Object} - The search payload
     * @return {Object} - The search result object with an array of users
     */
    search: function(payload) {
        // Supported @payload properties
        var licenseName = payload.licenseName;
        var searchFields = payload.searchFields || 'profile.user.name';
        var searchTerm = payload.searchTerm || '';
        var pageNum = payload.pageNum || 0;
        var pageSize = payload.pageSize || 10;
        var additionalQuery = payload.additionalQuery || '';

        if (!licenseName)
            return {
                list: [],
                total: 0
            };

        // Search for sys_user records through the `sn_employee_app_access` table
        var searchResults = [];
        var grSearch = new GlideRecord('sn_employee_app_access');
        grSearch.addActiveQuery();
        grSearch.addQuery('app.name', licenseName);
        grSearch.addEncodedQuery(this._buildEncodedQuery(searchFields, searchTerm));
        if (additionalQuery)
            grSearch.addEncodedQuery(additionalQuery);
        grSearch.addQuery('profile.user.active', true);
        grSearch.chooseWindow(pageNum * pageSize, pageNum * pageSize + pageSize);
        grSearch.orderBy("profile.user.name");
        grSearch.query();

        var totalPossibleResults = grSearch.getRowCount();

        while (grSearch.next()) {
            var grProfile = new GlideRecord('sn_employee_profile');
            if (!grProfile.get(grSearch.getValue('profile')) 
                    || !grProfile.canRead() 
                    || !grProfile.getElement('user').canRead() 
                    || !grProfile.getElement('user').getRefRecord().canRead())
                continue;

            searchResults.push(this._buildUserObject(grProfile));
        }

        return {
            list: searchResults,
            total: totalPossibleResults
        };
    },

    /* Build an encoded query to search
     * @param searchFields {String} - csv string of fields to search
     * @param searchTerm {String} - string search term
     * @return {String} - encoded query to search with
     */
    _buildEncodedQuery: function(searchFields, searchTerm) {
        var searchFieldsArr = searchFields.split(",");
        var queryArr = [];
        for (var i = 0; i < searchFieldsArr.length; i++) 
            queryArr.push(searchFieldsArr[i] + 'LIKE' + searchTerm);
        
        return queryArr.join('^OR');
    },

    /* Build a user object from an Employee Profile
     * @param grProfile {GlideRecord} - The GlideRecord to build the user object from
     * @return {Object} - An object representing a user 
     */
    _buildUserObject: function(grProfile) {
        return {
            sys_id: grProfile.getValue('user'),
            profile_id: grProfile.getUniqueValue(),
            name: grProfile.getDisplayValue('user.name'),
            title: grProfile.getDisplayValue('user.title'),
            department: grProfile.getDisplayValue('user.department'),
            avatar: grProfile.getDisplayValue('user.avatar'),
            email: grProfile.getDisplayValue('user.email')
        };
    },

    /**
     * @params
     * {String} licenseName - name of the app for employee lookup
     * {String} searchTermParam - the input part of a users name
     * {Integer} pageNumParam - the current page number
     * {Integer} pageSizeParam - the number of items per page
     * {String} excludedEmployeeIdsParam - the sys_ids of users that have already been added or that should be ignored.
     * These users will be left out of the results
     * {String} managerIdParam - the sys_id of the user that is the manager of the provided managed employee.
     * {String} searchFields - comma separted list of fields to search on
     */
    searchOrgHierarchy: function(licenseName, searchTermParam, pageNumParam, pageSizeParam, excludedEmployeeIdsParam, managerIdParam, searchFields) {
        if (!managerIdParam)
            return {
                list: [],
                total: 0
            };

        var MAX_NUM_EXCLUDE = 25;
        if (excludedEmployeeIdsParam && excludedEmployeeIdsParam.length > MAX_NUM_EXCLUDE) {
            gs.warn('searchLicensedProfilesSNC: Do not have more than 25 users selected at a time');
            return {
                results: []
            };
        }

        var results = [];

        //Get the list of users in the given user's org
        var teamHierarchyUtil = new sn_egd_lh.egd_lh_TeamHierarchy();
        var teamHierarchy = teamHierarchyUtil.getFlattenedHierarchySet(managerIdParam);

        var additionalQueryArr = [];
        if (excludedEmployeeIdsParam)
            additionalQueryArr.push('profile.user.sys_idNOT IN' + excludedEmployeeIdsParam.join(','));

        var searchResults = this.search({
            licenseName: licenseName,
            searchFields: searchFields,
            searchTerm: searchTermParam,
            pageNum: pageNumParam,
            pageSize: pageSizeParam,
            additionalQuery: additionalQueryArr.join('^')
        });

        // Make sure profiles are in the hierarchy
        searchResults.list.forEach(function(elem) {
            if (teamHierarchy.has(elem.sys_id))
                results.push(elem);
        });

        return {
            list: results,
            total: searchResults.total
        };
    },

    /**
     * @params
     * {String} licenseName - name of the app for employee lookup
     * {String} searchTermParam - the input part of a users name
     * {Integer} pageNumParam - the current page number
     * {Integer} pageSizeParam - the number of items per page
     * {String} excludedEmployeeIdsParam - the sys_ids of users that have already been added as mentors or that should be ignored.
     * These users will be left out of the results
     * {String} managerIdParam - the sys_id of the user that is the manager of the provided managed employee.
     * {Boolean} useGroupingMessage - group results if true
     * {Boolean} directReportsOnly - does not include non direct employees if true
     * {String} searchFields - comma separted list of fields to search on
     */
    searchHierarchy: function(licenseName, searchTermParam, pageNumParam, pageSizeParam, excludedEmployeeIdsParam, managerIdParam, useGroupingMessage, directReportsOnly, searchFields) {
        var MAX_NUM_EXCLUDE = 25;
        if (excludedEmployeeIdsParam && excludedEmployeeIdsParam.length > MAX_NUM_EXCLUDE) {
            gs.warn('searchLicensedProfilesSNC Do not have more than 25 users selected at a time');
            return {
                results: []
            };
        }

        // Search direct reports
        var directReports = this._searchDirectReports(licenseName, searchTermParam, excludedEmployeeIdsParam, managerIdParam, pageNumParam, pageSizeParam, searchFields);

        if (directReportsOnly)
            return directReports;

        // Search non direct reports
        var nonDirectReports = this._searchNonDirectReports(licenseName, searchTermParam, excludedEmployeeIdsParam, managerIdParam, pageNumParam, pageSizeParam, searchFields, directReports);

        // Add row for grouping message
        var shouldAddRowWithGroupingMessage = useGroupingMessage && pageNumParam === 0 && directReports.list.length;
        if (shouldAddRowWithGroupingMessage)
            directReports.list.unshift({
                groupingMessage: true
            });

        return {
            list: directReports.list.concat(nonDirectReports.list),
            total: directReports.total + nonDirectReports.total
        };
    },

    // Search for all users that are direct reports to the provided manager. Exclude users with
    // ids in excludedEmployeeIdsParam from the results.
    _searchDirectReports: function(licenseName, searchTermParam, excludedEmployeeIdsParam, managerIdParam, pageNumParam, pageSizeParam, searchFields) {
        if (!managerIdParam)
            return {
                list: [],
                total: 0
            };

        var additionalQueryArr = ['profile.user!=' + gs.getUserID()];
        if (excludedEmployeeIdsParam)
            additionalQueryArr.push('profile.user.sys_idNOT IN' + excludedEmployeeIdsParam.join(','));
        if (managerIdParam)
            additionalQueryArr.push('profile.user.manager=' + managerIdParam);

        var directReports = this.search({
            licenseName: licenseName,
            searchFields: searchFields,
            searchTerm: searchTermParam,
            pageNum: pageNumParam,
            pageSize: pageSizeParam,
            additionalQuery: additionalQueryArr.join('^')
        });

        // Set 'sameManager' property on these searched users
        for (var i = 0; i < directReports.list.length; i++) 
            directReports.list[i].sameManager = true;

        return directReports;
    },

    // Search for all users that are NOT direct reports to the provided manager. Exclude users with
    // ids in excludedEmployeeIdsParam from the results.
    _searchNonDirectReports: function(licenseName, searchTermParam, excludedEmployeeIdsParam, managerIdParam, pageNumParam, pageSizeParam, searchFields, directReports) {
        var isDirectReportsDoneOrLastPageIncomplete = pageNumParam * pageSizeParam <= directReports.total ?
            pageSizeParam - directReports.total > 0 :
            false;

        var pageNum = pageNumParam * pageSizeParam > directReports.total ?
            pageNumParam - Math.floor(directReports.total / pageSizeParam) :
            0;

        var pageSize = isDirectReportsDoneOrLastPageIncomplete || pageNum > 0 ?
            pageSizeParam :
            0; // just get total count when not retrieving records

        var additionalQueryArr = ['profile.user!=' + gs.getUserID()];
        if (excludedEmployeeIdsParam)
            additionalQueryArr.push('profile.user.sys_idNOT IN' + excludedEmployeeIdsParam.join(','));
        if (managerIdParam)
            additionalQueryArr.push('profile.user.manager!=' + managerIdParam + '^ORprofile.user.managerISEMPTY');

        var nonDirectReports = this.search({
            licenseName: licenseName,
            searchFields: searchFields,
            searchTerm: searchTermParam,
            pageNum: pageNum,
            pageSize: pageSize,
            additionalQuery: additionalQueryArr.join('^')
        });

        var shouldDelimitResults = directReports.total && pageNum === 0 && nonDirectReports.total;
        if (shouldDelimitResults)
            nonDirectReports.list.unshift({
                delimiter: true
            }); // add delimiter row between direct and non direct reports

        return nonDirectReports;
    },

    type: 'searchLicensedProfilesSNC'
};
