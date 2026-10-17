var SNHelpDocumentController = Class.create();
SNHelpDocumentController.prototype = {
    initialize: function() {
        this.constants = new SNHelpConstantProvider();
        this.dbController = new SNHelpDBController(this.constants.tables.guidance);
        this._helpUtil = new SNHelpUtil();
        // embedded help version to filter the document
        this.version = gs.getProperty("com.glide.embedded_help.version", gs.getProperty("glide.buildname"));
        this.enableAIGeneratedContent = gs.getProperty("com.glide.help_center.enable_ai_generated_content");
    },
    /*
    Checks to see if embedded help exists in database for given sys_id then
    checks if the user has a role for the help content
    If it does, return the help content.  If not, return null
    */
    getById: function(sys_id) {
        var ehContent,
            ehContentController,
            documentKeys,
            ehContentKeys;
        var result = this.dbController.getById(sys_id);

        if (!result)
            return null;

        if (!this.validateRoles(result.roles))
            return null;

        documentKeys = this.constants.restAPIKeys.document;
        result = this._helpUtil.constructPayLoad(documentKeys, [result]);



        if (Array.isArray(result) && result.length > 0) {
            result = result[0];
            if (result.eh_content) {
                ehContentController = new SNHelpDBController(this.constants.tables.eh_content);
                ehContent = ehContentController.getById(result.eh_content);
                ehContentKeys = this.constants.restAPIKeys.eh_content;
                result.eh_content = this._helpUtil.constructPayLoad(ehContentKeys, [ehContent]);

                if (Array.isArray(result.eh_content) && result.eh_content.length > 0)
                    result.eh_content = result.eh_content[0];
            }
            return result;
        } else
            return null;
    },

    searchDocuments: function(context, app_route, routeObj) {
        var i,
            query = "",
            result,
            relatedResults,
            documentKeys,
            orderByField = "order",
            searchResult = [];

        var arrayUtil = new ArrayUtil();
        if (!context)
            return null;

        query = this.getQuery(context, app_route);
        result = this.dbController.getByEncodedQuery(query, orderByField);

        query = this.getRelatedQuery(context, app_route);

        if (query) {
            relatedResults = this.dbController.getByEncodedQuery(query, orderByField);
        }


        if (result.length && relatedResults.length)
            arrayUtil.concat(result, relatedResults);
        else if (result.length || relatedResults.length)
            result = result.length ? result : relatedResults;
        else
            return null;

        documentKeys = this.constants.restAPIKeys.document;

        for (i = 0; i < result.length; i++) {
            if (this.validateRoles(result[i].roles) &&
                this.isSubSet(routeObj, result[i].route_params) &&
                (this.enableAIGeneratedContent === 'true' || (result[i].ai_generated === 'false' || result[i].ai_generated === ''))) {
                searchResult.push.apply(searchResult, this._helpUtil.constructPayLoad(documentKeys, [result[i]]));
            }
        }
        searchResult = this.filterDuplicateRecords(searchResult);
        return searchResult;
    },

    // Route values are attacker-controlled and get concatenated into an encoded query;
    // escape '^' so they can only match as a literal, and reject javascript: values.
    sanitizeRouteValue: function(value) {
        if (!value)
            return value;

        var str = value.toString();
        if (str.toLowerCase().indexOf("javascript:") === 0)
            return "sn_help_rejected_route_value";

        return GlideStringUtil.escapeQueryTermSeparator(str);
    },

    getQuery: function(context, app_route) {
        var query = "";

        context = this.sanitizeRouteValue(context);
        app_route = this.sanitizeRouteValue(app_route);

        if (app_route)
            query += "app_route=" + app_route + "^ORapp_route=" + this.constants.SN_ALL;
        else
            query += "app_route=NULL" + "^ORapp_route=" + this.constants.SN_ALL; // Should we return all the content here ???
        if (context)
            query += "^context=" + context + "^ORcontext=" + this.constants.SN_ALL;

        query = this.addFilterQuery(query);
        return query;
    },
    /*
     * if app_route is workspace and context is module/list/listId
     * return documents for  module/list
     * Also, if context is new_record/table return documents for record/table too..
     *
     */
    getRelatedQuery: function(context, app_route) {
        var separator = this.constants.separator,
            query = "",
            table,
            listWithId,
            newRecord;

        context = this.sanitizeRouteValue(context);
        app_route = this.sanitizeRouteValue(app_route);

        if (app_route && app_route.indexOf("workspace") === 0) {

            listWithId = ["module", "list", ""].join(separator),
                newRecord = ["new_record", ""].join(separator);

            if (context.indexOf(listWithId) >= 0) {
                query += "app_route=" + app_route;
                query += "^context=" + listWithId.substr(0, listWithId.length - 1);
            } else if (context.indexOf(newRecord) >= 0) {
                query += "app_route=" + app_route;
                table = context.split(separator)[1];
                query += "^context=" + ["record", table].join(separator);
            }
        }
        query = this.addFilterQuery(query);
        return query;
    },
    // if query is not empty add status published & type to embedded help
    addFilterQuery: function(query) {
        var version = this.version ? this.version.toLowerCase() : "";
        if (query) {
            query += "^active=true^status=published^type=embedded_help";
            query += "^version=" + version + "^ORversion=all";
        }
        return query;
    },

    /*
     * Check if guidance has non empty route_params 
     * and is subset of current request route_params
     */
    isSubSet: function(superSet, subSet) {
        if (!superSet)
            return false;

        if (!subSet)
            return true;

        try {
            if (typeof subSet === "string")
                subSet = JSON.parse(subSet);
            var self = this;
            return Object.keys(subSet).every(function(key) {
                var subsetItem = subSet[key];
                var supersetItem = superSet[key];
                var isNotSubSet;
                if (typeof subsetItem === 'object' && subsetItem !== null) {
                    isNotSubSet = !self.isSubSet(supersetItem, subsetItem);
                } else {
                    //Support dynamic values in route params
                    isNotSubSet = supersetItem.toString() !== subsetItem.toString() && subsetItem.toString().toLowerCase() !== "$dynamic_value$";
                }
                if (isNotSubSet)
                    return false;
                return true;
            });
        } catch (ex) {
            return false;
        }
    },

    /*
     * Check if the user has roles to access guidance record
     * returns true, if user has any one role matching list of roles specified on guidance record
     * return true, if there is no roles Specified on guidance record
     * returns false otherwise
     * param : roles - roles to check against current user to test if user has role to see this record.
     */
    validateRoles: function(roles) {
        // Return true for admin/maint user if debug_content is true.
        var canDebugContent = gs.getProperty("com.glide.embedded_help.debug_content", "false");

        if (canDebugContent === "true" && gs.getUser().hasRole("sn_help_admin"))
            return true;

        var currentRoles = gs.getSession().getRoles() + '';
        currentRoles = currentRoles.split(",");
        var arrayUtil = new ArrayUtil();
        if (roles) {
            roles = roles.split(",");
            for (var i = 0; i < roles.length; i++)
                if (arrayUtil.contains(currentRoles, roles[i].toLowerCase()))
                    return true;
            return false;
        } else {
            // No roles specified on guidance record...
            return true;
        }
    },
    /**
     * Filter duplicate records with same topic_id
     * This method only filter records when there is more than one record for
     * same topic_id, include record with roles.
     * @param records - list of records fetched for current user.
     * @returns - filtered records
     */
    filterDuplicateRecords: function(records) {
        var filteredRecords = [];
        for (var i = 0; i < records.length; i++) {
            var record = records[i];
            var duplicateIndex = -1;
            for (var j = 0; j < filteredRecords.length; j++) {
                if (record.topic_id && (filteredRecords[j].topic_id === record.topic_id)) {
                    if (filteredRecords[j].roles === '' && record.roles !== '') {
                        filteredRecords[j] = record;
                    }
                    duplicateIndex = j;
                    break;
                }
            }
            if (duplicateIndex === -1) {
                filteredRecords.push(record);
            }
        }
        return filteredRecords;
    },

    type: 'SNHelpDocumentController'
};
