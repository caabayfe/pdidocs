const ApplicationService = (function() {
    const CONSTANTS = Object.freeze({
        DEFAULT_PAGE_SIZE: 20,
    });
    const SORT_ORDER = Object.freeze({
        ASC: "ASC",
        DESC: "DESC",
    });
    const APPLICATION_SORT_FIELDS = Object.freeze({
        name: "name",
        created: "sys_created_on",
        lastAccessed: "last_accessed",
    });
    const APPLICATION_FILTERS = Object.freeze({
        ALL: "ALL",
        SHARED: "SHARED",
        OWNED: "OWNED",
        BOOKMARKS: "BOOKMARKS",
    });

    const OWNER_DESCRIPTOR = "8b0cbfc2c7132010d447c17cf4c26053";
    const REQUEST_APP_TABLE = "sn_creatorstudio_request_app_config";
    const USER_COLLABORATION_TABLE = "sys_appcollab_user";
    const DEVELOPER_HISTORY_TABLE = "sn_udc_developer_history";
    const APPLICATION_TABLE = "sys_scope";
    const REQUEST_APP_ROLE_ASSIGNMENT_VIEW =
        "sn_creatorstudio_request_app_role_assignment_view";
    const CREATOR_STUDIO_HISTORY_CONTEXT = "creator_studio";
    const HISTORY_RECORD_LIMIT = 1000;
    const BOOKMARKS_COLLECTION_TABLE = "sn_udc_collection_item";
    const BOOKMARKS_COLLECTION_M2M_TABLE = "sn_udc_collection_item_m2m";
    const DEFAULT_BOOKMARKS_COLLECTION_ID = "a231477dff240f50c76affffffffff8d";

    function getHistoryRecordLimit() {
        let historyRecordLimit = Number.parseInt(gs.getProperty('sn_creatorstudio.history_record_limit'));
        if (Number.isNaN(historyRecordLimit))
            historyRecordLimit = HISTORY_RECORD_LIMIT;

        return historyRecordLimit;
    }

    function encodeJoinQuery(options) {
        return `^JOIN${options.table}.${options.field}=${options.joinTable}.${options.joinField}!`;
    }

    function isFiltering(filter) {
        return [APPLICATION_FILTERS.OWNED, APPLICATION_FILTERS.SHARED, APPLICATION_FILTERS.BOOKMARKS].includes(filter);
    }

    function prefixColumnName(gr, field) {
        if (field === APPLICATION_SORT_FIELDS.name) return "sys_scope.name";

        switch (gr.getTableName()) {
            case REQUEST_APP_ROLE_ASSIGNMENT_VIEW:
                return `config_${field}`;
            default:
                return field;
        }
    }

    function grToRequestAppConfig(gr) {
        const sysScopeField = prefixColumnName(gr, "sys_scope");
        const colorField = prefixColumnName(gr, "color");
        const iconField = prefixColumnName(gr, "icon");
        return Object.freeze({
            appId: gr.getValue(sysScopeField),
            icon: gr.getValue(iconField),
            color: gr.getValue(colorField),
        });
    }

    function grToApplication(gr) {
        return Object.freeze({
            name: gr.getDisplayValue("name"),
            description: gr.getDisplayValue("short_description"),
            created: {
                value: gr.getValue("sys_created_on"),
                displayValue: gr.getDisplayValue("sys_created_on"),
            },
            createdBy: gr.getValue("sys_created_by"),
            canRead: gr.canRead(),
            sysId: gr.getValue("sys_id"),
        });
    }

    function sortApplicationsByLastAccessed(applications) {
        applications.sort((a, b) => {
            // can we maintain database sort here?
            //compare not accessed to not accessed
            if (!a.lastAccessed && !b.lastAccessed) {
                //check that both have created values. This should never happen, but there was a bug with a corrupted app so we're putting it here
                if (!a.created && !b.created) return 0;
                if (!a.created) return 1;
                if (!b.created) return -1;

                const aCreated = new GlideDateTime(a.created.value);
                const bCreated = new GlideDateTime(b.created.value);
                return bCreated.compareTo(aCreated);
            }
            //compare last accessed to not accessed
            if (!a.lastAccessed && b.lastAccessed) return 1;
            if (a.lastAccessed && !b.lastAccessed) return -1;

            const aLastAccessed = new GlideDateTime(a.lastAccessed.value);
            const bLastAccessed = new GlideDateTime(b.lastAccessed.value);
            // compare last accessed to last accessed
            return bLastAccessed.compareTo(aLastAccessed);
        });
    }

    function doCanReadCheck(gr) {
        if (!gr.canRead()) {
            const error = ErrorService.createError(
                ErrorService.ERROR_TYPES.UNAUTHORIZED,
                gs.getMessage(
                    "User is not authorized to read table {0}",
                    gr.getTableName()
                )
            );
            throw error;
        }
    }

    function getHistoryEntries(options) {
        // return new global.CreatorStudioDeveloperHistoryService().getHistoryEntries(options);
        // Users that have read access to sn_creatorstudio_request_app_config will have
        // read access to their own records in the sn_udc_developer_history table.
        doCanReadCheck(new GlideRecord(REQUEST_APP_TABLE));

        // Using GlideRecordSecure is not performant for large result sets for some users because of access checks.
        // See access check above.
        const grHistory = new GlideRecord(DEVELOPER_HISTORY_TABLE);
        grHistory.addQuery("user", gs.getUserID());
        if (typeof options.context === "string")
            grHistory.addQuery("context", options.context);

        //Adding join query and filtering out records that are being deleted
        const joinQuery = grHistory.addJoinQuery(REQUEST_APP_TABLE, "app", "sys_scope");
        joinQuery.addCondition("is_deleting", false);
        joinQuery.addOrCondition("is_deleting", null);

        // app specific criteria
        const historyQuery = grHistory.addQuery("file_table", "sys_scope"); // Keeping sys_scope for backwards compatibility, we are now specifying sys_app when adding the history via api
        historyQuery.addOrCondition("file_table", "sys_app"); // There should be no duplicate app entries int he Creator Studio context, so we can use OR. 

        // order by and limit
        if (Number.isInteger(options.limit) && options.limit >= 0)
            grHistory.setLimit(options.limit);

        grHistory.orderByDesc("last_accessed");

        grHistory.query();
        var records = [];
        while (grHistory.next()) {
            records.push({
                appId: grHistory.getValue("app"),
                lastAccessed: grHistory.getValue("last_accessed"),
            });
        }

        return records;
    }

    function setLastAccessedOnApplications(applications, lastAccessedMap) {
        applications.forEach((app) => {
            app["lastAccessed"] = lastAccessedMap[app.sysId] ?
                lastAccessedMap[app.sysId] :
                null;
        });
    }

    function transformRequestAppsToApps(requestAppConfigs) {
        // check users have access to read request app table
        doCanReadCheck(new GlideRecord(REQUEST_APP_TABLE));

        // Look up the application records associated with the request apps.
        // Using GlideRecord because some creator studio users may not have access to the app records, but
        // per requirements, need access to view app information on creator studio home page.
        const grSysScope = new GlideRecord(APPLICATION_TABLE);
        grSysScope.addQuery(
            "sys_id",
            "IN",
            requestAppConfigs.map((config) => config.appId)
        );
        grSysScope.query();
        const applicationMap = {};
        while (grSysScope.next()) {
            applicationMap[grSysScope.getUniqueValue()] = grToApplication(grSysScope);
        }

        const applications = requestAppConfigs.map((config) => {
            return {
                color: config.color,
                icon: config.icon,
                ...applicationMap[config.appId],
            };
        });
        return applications;
    }

    function setSortField(grApps, sortOrder, sortField) {
        if (sortField !== "lastAccessed") {
            const prefixedSortField = prefixColumnName(
                grApps,
                APPLICATION_SORT_FIELDS[sortField]
            );
            sortOrder === SORT_ORDER.ASC ?
                grApps.orderBy(prefixedSortField) :
                grApps.orderByDesc(prefixedSortField);
        }
    }


    function getOwnedApplicationsQuery(keyword, pageSize, offset, forceCount, sortOrder, sortField) {
        var ids = [];
        var grReqApp = new GlideRecord(REQUEST_APP_TABLE);
        // Join with App Collaboration User table
        var grJoin = grReqApp.addJoinQuery(USER_COLLABORATION_TABLE, "sys_scope", "application").addCondition("user", gs.getUserID()).addCondition("descriptor", OWNER_DESCRIPTOR);
        grReqApp.query();
        while (grReqApp.next()) {
            ids.push(grReqApp.getUniqueValue());
        }
        var gr2 = new GlideRecord(REQUEST_APP_TABLE);
        gr2.addQuery("sys_created_by", gs.getUserName());
        gr2.query();
        while (gr2.next()) {
            ids.push(gr2.getUniqueValue());
        }
        var finalGR = new GlideRecord(REQUEST_APP_TABLE);
        if (keyword) {
            finalGR.addQuery("sys_scope.name", "CONTAINS", keyword);
        }
        doCanReadCheck(finalGR);
        setSortField(finalGR, sortOrder, sortField);
        finalGR.addQuery("sys_id", "IN", ids.join(","));
        if (pageSize != null)
            finalGR.chooseWindow(offset, offset + pageSize, forceCount);
        const qc1 = finalGR.addQuery("is_deleting", false);
        qc1.addOrCondition("is_deleting", null);
        finalGR.addJoinQuery("sys_app", "sys_scope", "sys_id");
        return finalGR;
    }

    function createQuery(
        sortOrder,
        sortField,
        filter,
        keyword,
        pageSize,
        offset,
        forceCount = false,
    ) {
        let grApps = new GlideRecord(REQUEST_APP_TABLE);
        if (keyword)
            grApps.addQuery("sys_scope.name", "CONTAINS", keyword);
        doCanReadCheck(grApps);
        setSortField(grApps, sortOrder, sortField);
        if (pageSize !== undefined)
            grApps.chooseWindow(offset, offset + pageSize, forceCount);
        const userId = gs.getUserID();
        let qc = grApps.addQuery("is_deleting", false);
        qc.addOrCondition("is_deleting", null);
        //Filter Logic
        switch (APPLICATION_FILTERS[filter]) {
            case APPLICATION_FILTERS.SHARED:
                grApps = new GlideAggregate(REQUEST_APP_ROLE_ASSIGNMENT_VIEW); // this could possibly be a large query
                if (keyword)
                    grApps.addQuery("config_sys_scope.name", "CONTAINS", keyword);
                grApps.addQuery("userhasrole_user", userId);
                var cqc = grApps.addQuery("config_is_deleting", false);
                cqc.addOrCondition("config_is_deleting", null);
                setSortField(grApps, sortOrder, sortField);
                grApps.groupBy("config_sys_scope");
                grApps.groupBy("config_icon");
                grApps.groupBy("config_color");
                if (pageSize !== undefined)
                    grApps.chooseWindow(offset, offset + pageSize - 1, forceCount); // GlideAggregate window is inclusive unlike GlideRecord
                break;
            case APPLICATION_FILTERS.OWNED:
                return getOwnedApplicationsQuery(keyword, pageSize, offset, forceCount, sortOrder, sortField);
            case APPLICATION_FILTERS.BOOKMARKS:
                var collectionGr = grApps.addJoinQuery(
                    BOOKMARKS_COLLECTION_TABLE,
                    "sys_scope",
                    "file"
                );
                collectionGr.addCondition("file_table", 'sys_app');
                collectionGr.addCondition("user", userId);
                var m2mJoin = grApps.addJoinQuery(
                    BOOKMARKS_COLLECTION_M2M_TABLE,
                    "sys_scope",
                    "collection_item.file"
                );
                m2mJoin.addCondition("collection", DEFAULT_BOOKMARKS_COLLECTION_ID);
                break;
            default:
                break;
        }

        // DEF0509516 - filter out sys_store_app records
        if (grApps.getTableName() === REQUEST_APP_ROLE_ASSIGNMENT_VIEW) {
            grApps.addQuery("config_sys_scope.sys_class_name", "sys_app");
        } else {
            grApps.addJoinQuery("sys_app", "sys_scope", "sys_id");
        }

        return grApps;
    }

    function getLastAccessedMapAndIds() {
        const historyEntries = getHistoryEntries({
            limit: getHistoryRecordLimit(),
            context: CREATOR_STUDIO_HISTORY_CONTEXT,
        });
        const lastAccessedMap = {};
        const lastAccessedAppIds = [];
        historyEntries.forEach((entry) => {
            lastAccessedAppIds.push(entry.appId);
            lastAccessedMap[entry.appId] = {
                value: entry.lastAccessed,
                displayValue: new GlideDateTime(entry.lastAccessed).getDisplayValue(),
            };
        });
        return Object.freeze({
            lastAccessedMap: Object.freeze(lastAccessedMap),
            lastAccessedAppIds: Object.freeze(lastAccessedAppIds)
        });
    }

    function getFilteredLastAccessedAppIds(
        sortOrder,
        sortField,
        filter,
        lastAccessedAppIds,
        keyword,
        pageSize,
        offset,
    ) {
        // Only needed if filtering
        // applying additional filter check for search keyword to run query
        if (keyword || isFiltering(filter)) {
            const grFilteredAppIds = createQuery(sortOrder, sortField, filter, keyword);
            grFilteredAppIds.query();
            const sysScopeField = prefixColumnName(grFilteredAppIds, "sys_scope");
            const filteredAppIds = [];
            while (grFilteredAppIds.next()) {
                filteredAppIds.push(grFilteredAppIds.getValue(sysScopeField));
            }
            return Object.freeze(
                lastAccessedAppIds.filter((id) => filteredAppIds.includes(id))
            );
        }
        return lastAccessedAppIds; // No filtering
    }

    function getRemainingNotAccessedAppsQuery(
        filter,
        pageSize,
        currentPage,
        filteredLastAccessedAppIds,
        keyword
    ) {
        // Last Accessed Apps are exhausted, query for apps that have not been accessed to fill the window
        const neededApps =
            pageSize * currentPage - filteredLastAccessedAppIds.length;
        let newOffset =
            Math.floor((neededApps - 1) / pageSize) * pageSize -
            (filteredLastAccessedAppIds.length % pageSize);
        newOffset = newOffset < 0 ? 0 : newOffset;
        const newPageSize = neededApps < pageSize ? neededApps : pageSize;
        const remainingAppsGr = createQuery(
            SORT_ORDER.DESC,
            "created",
            filter,
            keyword,
            newPageSize,
            newOffset
        );
        const sysScopeField = prefixColumnName(remainingAppsGr, "sys_scope");
        remainingAppsGr.addQuery(
            sysScopeField,
            "NOT IN",
            filteredLastAccessedAppIds
        );
        return remainingAppsGr;
    }

    function getOwnedApplicationsCount(keyword) {
        // Reuse the query logic from getOwnedApplicationsQuery
        const query = getOwnedApplicationsQuery(keyword, null, null, null, null, null);
        query.query();
        return query.getRowCount();
    }

    function getSharedApplicationsCount(keyword) {
        var grApps = new GlideAggregate(REQUEST_APP_ROLE_ASSIGNMENT_VIEW);
        if (keyword)
            grApps.addQuery("config_sys_scope.name", "CONTAINS", keyword);
        grApps.addAggregate("COUNT(DISTINCT", "config_sys_scope.sys_id");
        grApps.setGroup(false);
        grApps.addQuery("userhasrole_user", gs.getUserID());
        grApps.addQuery("config_sys_scope.sys_class_name", "sys_app");
        let qc = grApps.addQuery("config_is_deleting", false);
        qc.addOrCondition("config_is_deleting", null);
        grApps.query();
        if (grApps.next()) {
            return grApps.getAggregate("COUNT(DISTINCT", "config_sys_scope.sys_id");
        }
        return 0;
    }

    function getAllApplications(keyword) {
        let grApps = new GlideAggregate(REQUEST_APP_TABLE);
        if (keyword)
            grApps.addQuery("sys_scope.name", "CONTAINS", keyword);
        const joinQuery = encodeJoinQuery({
            table: REQUEST_APP_TABLE,
            field: "sys_scope",
            joinTable: "sys_app",
            joinField: "sys_id",
        });
        grApps.addEncodedQuery(joinQuery, true);
        grApps.addAggregate('COUNT');
        let qc = grApps.addQuery("is_deleting", false);
        qc.addOrCondition("is_deleting", null);
        grApps.query();
        var recordCount = 0;
        if (grApps.next()) {
            recordCount = grApps.getAggregate('COUNT');
            return recordCount;
        }
        return recordCount;
    }

    function getBookmarkedAppsCount(keyword) {
        let grApps = new GlideRecordSecure(REQUEST_APP_TABLE);
        if (keyword)
            grApps.addQuery("sys_scope.name", "CONTAINS", keyword);
        var collectionGr = grApps.addJoinQuery(
            BOOKMARKS_COLLECTION_TABLE,
            "sys_scope",
            "file"
        );
        collectionGr.addCondition("file_table", 'sys_app');
        collectionGr.addCondition("user", gs.getUserID());
        var m2mJoin = grApps.addJoinQuery(
            BOOKMARKS_COLLECTION_M2M_TABLE,
            "sys_scope",
            "collection_item.file"
        );
        m2mJoin.addCondition("collection", DEFAULT_BOOKMARKS_COLLECTION_ID);
        let qc = grApps.addQuery("is_deleting", false);
        qc.addOrCondition("is_deleting", null);
        grApps.query();
        return grApps.getRowCount();
    }

    function getLastAccessedApps(
        sortOrder,
        sortField,
        filter,
        pageSize,
        currentPage,
        offset,
        totalRecordCount,
        lastAccessedMap,
        lastAccessedAppIds,
        keyword
    ) {
        const filteredLastAccessedAppIds = getFilteredLastAccessedAppIds(
            sortOrder,
            sortField,
            filter,
            lastAccessedAppIds,
            keyword,
            pageSize,
            offset
        ); // Sorted, filtered list of last accessed ids
        const requestAppGr = createQuery(sortOrder, sortField, filter, keyword); // no paging info but it will be paged by the filtering below

        const sysScopeField = prefixColumnName(requestAppGr, "sys_scope");
        requestAppGr.addQuery(
            sysScopeField,
            "IN",
            filteredLastAccessedAppIds.slice(offset, offset + pageSize)
        ); // this query is not sorting on last accessed and it has a window via IN query
        requestAppGr.query();

        const requestAppConfigs = [];
        while (requestAppGr.next()) {
            if (requestAppGr.canRead()) {
                requestAppConfigs.push(grToRequestAppConfig(requestAppGr));
            }
        }

        if (
            requestAppConfigs.length < pageSize &&
            requestAppConfigs.length + offset < totalRecordCount
        ) {
            const remainingAppsGr = getRemainingNotAccessedAppsQuery(
                filter,
                pageSize,
                currentPage,
                filteredLastAccessedAppIds,
                keyword
            );
            remainingAppsGr.query();
            while (remainingAppsGr.next()) {
                if (remainingAppsGr.canRead()) {
                    requestAppConfigs.push(grToRequestAppConfig(remainingAppsGr));
                }
            }
        }

        const applications = transformRequestAppsToApps(requestAppConfigs);
        setLastAccessedOnApplications(applications, lastAccessedMap);
        sortApplicationsByLastAccessed(applications);
        return applications;
    }

    return class ApplicationService {
        /**
         * Gets a list of request apps editable in CreatorStudio
         *
         * @param payload, object with fields (sortField, sortOrder, currentPage, pageSize)
         * @returns a object with an array of applications and object with pagination metadata
         */
        static getApplications(payload) {
            const {
                currentPage = 1,
            } = payload;
            const sortField = payload.sortField || APPLICATION_SORT_FIELDS.name;
            const keyword = payload.searchProperties?.keyword || '';
            const sortOrder = payload.sortOrder ?
                payload.sortOrder.toUpperCase() :
                SORT_ORDER.ASC;
            const pageSize = payload.pageSize || CONSTANTS.DEFAULT_PAGE_SIZE;
            const filter = payload.filter || APPLICATION_FILTERS.ALL;
            //Validations
            if (sortField && !APPLICATION_SORT_FIELDS.hasOwnProperty(sortField)) {
                const supportedFields = Object.getOwnPropertyNames(
                    APPLICATION_SORT_FIELDS
                ).join(",");
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage(
                        "invalid 'sortField' value: '{0}', please use one of the supported fields: ({1})",
                        [sortField, supportedFields]
                    )
                );
                throw error;
            }
            if (sortOrder && !SORT_ORDER.hasOwnProperty(sortOrder.toUpperCase())) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("Sort only supports 'ASC' or 'DESC'")
                );
                throw error;
            }
            if (filter && !APPLICATION_FILTERS.hasOwnProperty(filter)) {
                const supportedFilters =
                    Object.getOwnPropertyNames(APPLICATION_FILTERS).join(",");
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage(
                        "invalid 'filter': '{0}', please use one of the supported filters: ({1})",
                        [filter, supportedFilters]
                    )
                );
                throw error;
            }
            if (sortField === "lastAccessed" && sortOrder !== SORT_ORDER.DESC) {
                const error = ErrorService.createError(
                    ErrorService.ERROR_TYPES.BAD_REQUEST,
                    gs.getMessage("'lastAccessed' sort only supports 'DESC' order")
                );
                throw error;
            }

            //Core logic
            const offset = (currentPage - 1) * pageSize;
            const grApps = createQuery(
                sortOrder,
                sortField,
                filter,
                keyword,
                pageSize,
                offset,
                true,
            );
            grApps.query();

            const totalRecordCount = grApps.getRowCount(); // Used for count with chooseWindow
            const {
                lastAccessedMap,
                lastAccessedAppIds
            } = getLastAccessedMapAndIds();

            let applications;
            if (sortField === "lastAccessed") {
                applications = getLastAccessedApps(
                    sortOrder,
                    sortField,
                    filter,
                    pageSize,
                    currentPage,
                    offset,
                    totalRecordCount,
                    lastAccessedMap,
                    lastAccessedAppIds,
                    keyword
                );
            } else {
                const requestAppConfigs = [];
                while (grApps.next()) {
                    if (grApps.canRead()) {
                        requestAppConfigs.push(grToRequestAppConfig(grApps));
                    }
                }
                applications = transformRequestAppsToApps(requestAppConfigs);
                setLastAccessedOnApplications(applications, lastAccessedMap);
            }

            const totalPageCount = Math.ceil(totalRecordCount / pageSize);
            return {
                results: applications,
                pagination: {
                    totalRecordCount,
                    totalPageCount,
                    currentPage,
                    pageSize,
                },

            };
        }

        static getApplicationsCount(payload) {
            doCanReadCheck(new GlideRecord(REQUEST_APP_TABLE));
            const keyword = payload?.searchProperties?.keyword || '';
            const totalAppCount = getAllApplications(keyword);
            return {
                totalAppCount,
                totalOwnedAppCount: getOwnedApplicationsCount(keyword),
                totalSharedAppCount: getSharedApplicationsCount(keyword),
                totalBookmarkedAppCount: getBookmarkedAppsCount(keyword)
            };
        }
    };
})();
