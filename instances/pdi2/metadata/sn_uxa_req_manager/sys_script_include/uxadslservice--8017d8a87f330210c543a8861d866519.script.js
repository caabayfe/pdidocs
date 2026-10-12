var UXADSLService = Class.create();
UXADSLService.prototype = {
    initialize: function() {
        this.logger = QueryServiceApiLogger.getLogger('UXADSLService');
        this.utils = new UXAUtils();
    },

    getDSL: function(uxaDTO) {
        return this.createDSL(uxaDTO);
    },

    getFunnelDSL: function(uxaDTO) {
        const funnelFilterDSL = uxaDTO.getFilters();
        this.logger.debug(funnelFilterDSL);
        const funnelSteps = uxaDTO.getFunnelSteps();
        const funnelFlag = uxaDTO.getFunnelFlag();
        if (funnelFlag) {
            const funnelFilter = {
                "UserState": {
                    '$eq': 'New'
                }
            };
            funnelFilterDSL.push(funnelFilter);
        }
        const funnelDSL = {
            "sampling_level": uxaDTO.getSamplingLevel() || null,
            "query_filter": {
                "$and": funnelFilterDSL
            },
            "steps": funnelSteps || [],
        };

        return funnelDSL;
    },

    getNavigationPathsDSL: function(uxaDTO) {
        const filtersDSL = uxaDTO.getFilters();
        const samplingLevel = uxaDTO.getSamplingLevel();
        const pageName = uxaDTO.getNavPageName() || "";
        const navigationPathsDSL = {
            "page_name": pageName,
            "query_filter": {
                "$and": filtersDSL
            }
        };
        //TODO sample_size to sampling_level
        if (samplingLevel)
            navigationPathsDSL["sampling_level"] = samplingLevel;

        return navigationPathsDSL;
    },


    getCohortDSL: function(uxaDTO) {
        const cohortFilterDSL = uxaDTO.getFilters();
        const cohortSteps = uxaDTO.getCohortSteps();
        const cohortBucketType = uxaDTO.getBucketType();
        const cohortFlag = uxaDTO.getCohortFlag();
        if (cohortFlag) {
            const cohortFilter = {
                "UserState": {
                    '$eq': 'New'
                }
            };
            cohortFilterDSL.push(cohortFilter);
        }
        const cohortDSL = {
            "query_filter": {
                "$and": cohortFilterDSL
            },
            "steps": cohortSteps,
            "bucket_type": cohortBucketType,
            "tz_offset_in_minutes": this.utils.getSessionTimezoneOffset()
        };

        if (uxaDTO.getSamplingLevel())
            cohortDSL["sampling_level"] = uxaDTO.getSamplingLevel();

        return cohortDSL;
    },

    createDSL: function(uxaDTO) {
        let dslType = uxaDTO.getType() ? UXAConstants.TYPE[uxaDTO.getType().toUpperCase()] : undefined;
        if (!dslType)
            throw new Error(`Invalid type: ${dslType}`);

        let dsl = this.getDefaultQueryDSLObject(dslType, uxaDTO);
        const query = dsl.query;
        this.updateProjection(query, uxaDTO);
        this.updateFilter(query, uxaDTO.getFilters());
        if (!uxaDTO.getIsShowOther())
            this.updatePaging(query, uxaDTO);

        //For Users & App type queries, update type to sessions.
        if ([UXAConstants.TYPE.USERS, UXAConstants.TYPE.APPLICATION].includes(dslType))
            query.type = UXAConstants.TYPE.SESSIONS;

        //DEF0602788: Added fully tracked user check for sessions/users count and table.
        if ([UXAConstants.TYPE.USERS, UXAConstants.TYPE.SESSIONS].includes(uxaDTO.getType()) &&
            UXAConstants.DATA_CATEGORY.DATATABLE == uxaDTO.getDataCategory()) {
            query.type = {
                "sessions": {
                    "tracked_users_only": true
                }
            };
        }

        dsl.query = JSON.stringify(query);
        return dsl;
    },

    updateProjection: function(dsl, uxaDTO) {

        let metric = uxaDTO.getMetric()?.toUpperCase();
        if (uxaDTO.getMetricField())
            metric = metric + '_' + uxaDTO.getMetricField().toUpperCase();
        if (uxaDTO.getMetricDivision())
            metric = metric + '_' + uxaDTO.getMetricDivision().toUpperCase();

        const defAggColumns = UXAConstants.DEFAULT_AGGREGATION_COLUMNS[dsl.type.toUpperCase()];
        const aggregationObj = defAggColumns[metric] || defAggColumns["COUNT"];

        let aggColumn = aggregationObj?.NAME;
        const alias = aggregationObj?.ALIAS;
        const aggregation = aggregationObj?.AGGREGATION;

        const projection = [];
        let projObj = {};
        let groupByFields = uxaDTO.getGroupBys();
        const uniqueColumnKeys = new Set();
        switch (uxaDTO.getDataCategory()) {
            case UXAConstants.DATA_CATEGORY.SIMPLE:
                //This if block is to get Others count for event properties. EventProperties is the part of groupby.
                if (UXAConstants.TYPE.EVENTS == dsl.type && groupByFields?.length)
                    aggColumn = groupByFields;

                this.addProjection(projection, aggregation, aggColumn, alias, uniqueColumnKeys);
                break;

            case UXAConstants.DATA_CATEGORY.GROUP: {
                let includeOtherMaxGroups = true;
                for (let groupBy of groupByFields) {
                    if (UXAConstants.DATA_POINTS_GROUPBY[groupBy?.toUpperCase()]) {
                        const groupByObjects = UXAConstants.DATA_POINTS_GROUPBY[groupBy?.toUpperCase()];
                        groupByObjects.forEach(groupsObj => {
                            projection.push(groupsObj.GROUPBY);
                            this.updateGroup(dsl, groupsObj.ALIAS, uxaDTO, includeOtherMaxGroups);
                            // Adding Offset for hourly usage
                            if (UXAConstants.DATA_POINTS_COLUMNS.HOURLY_USAGE == groupBy) {
                                groupsObj.GROUPBY['$toHour'] = {
                                    "field": "StartTime",
                                    "timezone_offset": this.utils.getSessionTimezoneOffset()
                                };
                            }
                            includeOtherMaxGroups = false;
                        });
                    } else {
                        projObj = {};
                        this.updateProjectionGroups(projObj, groupBy, aggColumn, projection, dsl, uxaDTO, includeOtherMaxGroups, '', uniqueColumnKeys);
                    }

                    includeOtherMaxGroups = false;
                }

                this.addProjection(projection, aggregation, aggColumn, alias, uniqueColumnKeys);
                this.updateOrder(dsl, uxaDTO.getSortOrder(), alias);
            }
            break;

            case UXAConstants.DATA_CATEGORY.TREND:
                var trendProjObj = {};
                var trendAgg = UXAConstants.TREND_INTERVAL_TO_PROJECTION[uxaDTO.getTrendInterval()].projection;
                var trendAggAlias = UXAConstants.TREND_INTERVAL_TO_PROJECTION[uxaDTO.getTrendInterval()].alias;
                trendProjObj[trendAgg] = {
                    field: this.utils.getTimestampColumn(uxaDTO),
                    timezone_offset: this.utils.getSessionTimezoneOffset()
                };
                trendProjObj["alias"] = trendAggAlias;
                projection.push(trendProjObj);
                this.updateGroup(dsl, trendAggAlias, uxaDTO);

                if (groupByFields?.length) {
                    for (let groupBy of groupByFields) {
                        this.updateProjectionGroups(projObj, groupBy, aggColumn, projection, dsl, uxaDTO, false, '', uniqueColumnKeys);
                        projObj = {};
                    }
                }

                this.addProjection(projection, aggregation, aggColumn, alias, uniqueColumnKeys);
                this.updateOrder(dsl, UXAConstants.SORT_ORDER_ASC, trendAggAlias);
                break;

            case UXAConstants.DATA_CATEGORY.DATATABLE:
                if (UXAConstants.METRIC.COUNT == uxaDTO.getMetric()) {
                    this.addProjection(projection, UXAConstants.DSL_AGGREGATION_FN.UNIQUE, aggColumn, alias, uniqueColumnKeys);
                } else if (UXAConstants.METRIC.EVENT_EXPORT === uxaDTO.getMetric()) {
                    // Event details export
                    const defaultColumns = UXAConstants.DATATABLE_COLUMNS.EVENT_EXPORT;
                    Object.entries(defaultColumns).forEach(([key, value]) => {
                        this.addProjection(projection, null, value.COLUMN, key, uniqueColumnKeys);
                    });
                    uxaDTO.getEventProperties().forEach((prop) => {
                        projObj = {};
                        // Replacing empty spaces and special characters as it breaks the QueryService
                        projObj[prop.id] = prop.label.replace(/[^a-zA-Z0-9]/g, '');
                        projection.push(projObj);
                    });
                } else {
                    const defaultColumns = UXAConstants.DATATABLE_COLUMNS[dsl.type.toUpperCase()];

                    let selectedColumns = [...uxaDTO.getSelectedColumns()];

                    if ([UXAConstants.TYPE.SESSIONS].includes(dsl.type) &&
                        !(selectedColumns.includes(UXAConstants.SESSION_ID_ALIAS) || uxaDTO.getIsExport())) {
                        selectedColumns.push(UXAConstants.SESSION_ID_ALIAS);
                    }

                    if ([UXAConstants.TYPE.USERS, UXAConstants.TYPE.SESSIONS].includes(dsl.type) &&
                        !(selectedColumns.includes(UXAConstants.ANONYMOUS_USER_ALIAS))) {
                        selectedColumns.push(UXAConstants.ANONYMOUS_USER_ALIAS);
                    }

                    const defaultColumnsKeys = Object.keys(defaultColumns);
                    if (!(selectedColumns && selectedColumns.length))
                        selectedColumns = defaultColumnsKeys;

                    const channel = uxaDTO.getChannel();
                    selectedColumns?.forEach(key => {
                        const value = defaultColumns[key];
                        if (value && value.DB_COLUMN === 'false') {
                            return; // Use 'return' instead of 'continue' to skip this iteration in forEach
                        }

                        if (value) {
                            // If the channel is mobile and MOBILE_COLUMN exists, use MOBILE_COLUMN instead of COLUMN
                            if (channel == UXAConstants.CHANNEL_ENUM.MOBILE.ID && value.MOBILE_COLUMN) {
                                value.COLUMN = value.MOBILE_COLUMN;
                            }
                            if (value.AGGREGATION) {
                                this.addProjection(projection, value.AGGREGATION, value.COLUMN, key, uniqueColumnKeys);
                            } else if (value.COLUMN) {
                                this.addProjection(projection, null, value.COLUMN, key, uniqueColumnKeys);
                            } else if (value.COLUMNS?.length > 0) {
                                value.COLUMNS.forEach(column => {
                                    if (column.AGGREGATION) {
                                        this.addProjection(projection, column.AGGREGATION, column.COLUMN, column.ALIAS || key, uniqueColumnKeys);
                                    } else {
                                        this.addProjection(projection, null, column, column.ALIAS || column, uniqueColumnKeys);
                                    }
                                });
                            }
                        } else {
                            // handle non-default columns (including user properties)
                            //Check if there is respective column mapping present
                            if (UXAConstants.DATA_POINTS_COLUMNS[key]) {
                                projObj = {};
                                const column = UXAConstants.DATA_POINTS_COLUMNS[key];
                                projObj[column] = key;
                                projection.push(projObj);
                            } else {
                                projObj = {};
                                const alias = this.sanitizeCustomColumnAlias(key);

                                // the same value needs to go under GROUP also
                                projObj[key] = alias;
                                projection.push(projObj);
                            }
                        }
                    });

                    // add groups for default and non-default columns (including user properties)
                    selectedColumns.forEach(col => {
                        if (defaultColumnsKeys.includes(col)) {
                            if (defaultColumns?.GROUPBY?.includes(col)) {
                                this.updateGroup(dsl, col, uxaDTO);
                            }
                        } else {
                            this.updateGroup(dsl, col, uxaDTO);
                        }
                    });
                    this.updateDatatableOrder(dsl, defaultColumns.ORDERBY, uxaDTO);
                }
                break;
        }

        dsl.projection = projection;
    },

    sanitizeCustomColumnAlias: function(customColumn) {
        return customColumn.replace(/\./g, '__')
            .replace(/^DISTINCT\s+/i, '')
            .replace(/\['/g, '__')
            .replace(/'\]/g, '');
    },

    updateFilter: function(dsl, filters) {
        if (filters && filters.length > 0) {
            dsl.filter = {
                "$and": filters
            };
        }

    },

    updateGroup: function(dsl, aggColumn, uxaDTO, includeOtherMaxGroups = false) {
        let group = aggColumn || uxaDTO.getGroupBy();
        if (group && group.includes('DISTINCT')) {
            return;
        }
        group = this.sanitizeCustomColumnAlias(group);
        if (uxaDTO.getIsShowOther() && includeOtherMaxGroups) {
            group = {
                "name": group,
                "others": true,
                "max_groups": uxaDTO.getNumberOfGroups()
            };
        }
        dsl.group.push(group);
    },

    updateOrder: function(dsl, sortOrder, orderByColumn) {
        if (orderByColumn) {
            const orderObj = {};
            orderObj[orderByColumn] = sortOrder || UXAConstants.SORT_ORDER_DESC;

            //sort in case insensitive manner if the column name is part of the DATATABLE_ORDER_BY_STRING_TYPE_COLUMNS
            if (UXAConstants.DATATABLE_ORDER_BY_STRING_TYPE_COLUMNS[dsl.type.toUpperCase()]?.includes(orderByColumn)) {
                dsl.order.push({
                    "$toLower": orderObj
                });
                return;
            }
            dsl.order.push(orderObj);
        }
    },

    //Handles dataTable orderByColumn. If orderByColumn is absent in selectedColumns, update selectedColumns[0] as Orderby
    updateDatatableOrder: function(dsl, orderByColumn, uxaDTO) {
        const sortOrder = uxaDTO.getSortOrder();
        orderByColumn = uxaDTO.getOrderBy() || orderByColumn;
        let selectedColumns = uxaDTO.getSelectedColumns();
        if (selectedColumns?.length && !selectedColumns.includes(orderByColumn))
            orderByColumn = selectedColumns[0];

        this.updateOrder(dsl, sortOrder, orderByColumn);
    },

    _updateCompositeOrderBy: function(dslType, sortOrder, orderByColumn) {
        const compositeOrderbys = UXAConstants.COMPOSITE_ORDERBY[dslType.toUpperCase()] || undefined;
        if (compositeOrderbys?.includes(orderByColumn)) {
            const columns = UXAConstants.DATATABLE_COLUMNS[dslType.toUpperCase()]?.[orderByColumn]?.COLUMNS;
            if (columns?.length > 0) {
                if (sortOrder == UXAConstants.SORT_ORDER_ASC)
                    return columns.toString();
                return columns.join(` ${UXAConstants.SORT_ORDER_DESC}, `);
            }
        }
        return orderByColumn;
    },

    updatePaging: function(dsl, uxaDTO) {
        if (uxaDTO.getPageSize()) {
            dsl.paging.limit = uxaDTO.getPageSize();
            if (uxaDTO.getPageNumber())
                dsl.paging.skip = (uxaDTO.getPageNumber() - 1) * uxaDTO.getPageSize();
        }
        return dsl;
    },

    getDefaultQueryDSLObject: function(dslType, uxaDTO) {
        const dsl = {
            "query": {
                "type": dslType,
                "projection": [],
                "filter": {
                    //"$and":[{"Timestamp":{"$gte":"2024-04-01"}},{"Timestamp":{"$lt":"2024-10-01"}},{"AppSysId":"App1"}, {"Name": {"$eq": "Event3"}}]
                }
            }
        };
        if (UXAConstants.DATA_CATEGORY.SIMPLE == uxaDTO.getDataCategory())
            return dsl;

        dsl.query["group"] = [];
        dsl.query["order"] = [];

        if (UXAConstants.DATA_CATEGORY.TREND == uxaDTO.getDataCategory())
            return dsl;

        if (!uxaDTO.getIsShowOther())
            dsl.query["paging"] = {
                "limit": (UXAConstants.DATA_CATEGORY.GROUP == uxaDTO.getDataCategory()) ? UXAConstants.UXA_GROUP_LIMIT : UXAConstants.UXA_DATATABLE_LIMIT,
                "skip": 0
            };
        if (uxaDTO?.getGroupBys()?.indexOf(UXAConstants.DATA_POINTS_COLUMNS.HOURLY_USAGE) === 0)
            dsl.query["paging"] = {
                "limit": UXAConstants.UXA_HOURLY_USAGE_GROUP_LIMIT,
                "skip": 0
            };
        return dsl;
    },

    getSinglePageNavDSL: function(uxaDTO) {
        const dsl = {
            "page_name": uxaDTO.getPageId(),
            "top_pages_threshold": 10,
            "direction": (uxaDTO.getMetric() === UXAConstants.METRIC.PAGE_NAV.BAR_METRIC_NEXT_PAGE) ? UXAConstants.NEXT : UXAConstants.PREV
        };
        const filters = uxaDTO.getFilters();
        if (filters && filters.length > 0) {
            dsl.query_filter = {
                "$and": filters
            };
        }

        if (uxaDTO.getSamplingLevel())
            dsl["sampling_level"] = uxaDTO.getSamplingLevel();

        return dsl;
    },

    getSesionsActivityTimelineDSL: function(uxaDTO) {
        const dsl = {
            "session_id": uxaDTO.getSessionId(),
            "instance_user_id": uxaDTO.getUserId(),
            "sort_direction": uxaDTO.getSortOrder() || UXAConstants.SORT_ORDER_DESC
        };
        return dsl;
    },

    //TODO: Review the dsl creation logic
    getRetentionDSL: function(uxaDTO) {
        const retentionDSL = {};
        retentionDSL['bucket_type'] = uxaDTO.getBucketType();
        if (uxaDTO.getFilters() && uxaDTO.getFilters().length)
            retentionDSL['query_filter'] = {
                "$and": uxaDTO.getFilters()
            };
        switch (uxaDTO.getDataCategory()) {
            case UXAConstants.DATA_CATEGORY.COHORT:
                retentionDSL['tz_offset_in_minutes'] = this.utils.getSessionTimezoneOffset();
                if (uxaDTO.getSamplingLevel())
                    retentionDSL['sampling_level'] = uxaDTO.getSamplingLevel();
                break;
            case UXAConstants.DATA_CATEGORY.SIMPLE:
            case UXAConstants.DATA_CATEGORY.GROUP:
                switch (uxaDTO.getMetricField()) {
                    case UXAConstants.METRIC_FIELD.RETENTION.NEVER_RETURNED_COUNT:
                    case UXAConstants.METRIC_FIELD.RETENTION.RETURNED_AFTER_TIME_COUNT:
                    case UXAConstants.METRIC_FIELD.RETENTION.SESSION_FREQUENCY:
                        return retentionDSL;
                    case UXAConstants.METRIC_FIELD.RETENTION.AVG_TIME_BETWEEN_SESSIONS:
                        retentionDSL['bucket_type'] = uxaDTO.getBucketType();
                        retentionDSL['first_sessions_range'] = uxaDTO.getGroupBys()?.length ? 8 : 2;
                        break;
                }
        }
        return retentionDSL;
    },

    updateProjectionGroups: function(projection, groupBy, aggColumn, projections, dsl, uxaDTO, includeOtherMaxGroups = false, alias = '', uniqueColumnKeys) {
        projection = {};
        const resolvedGroupBy = UXAConstants.DATA_POINTS_COLUMNS[groupBy?.toUpperCase()] || groupBy || aggColumn;
        let groupByAlias = '';
        if (groupBy.includes('UserProperties')) {
            groupByAlias = groupBy.replace(/\./g, '__')
        } else {
            groupByAlias = (alias || resolvedGroupBy).replace(/[^a-zA-Z0-9]/g, '');
        }

        this.addProjection(projections, null, resolvedGroupBy, groupByAlias, uniqueColumnKeys);
        this.updateGroup(dsl, groupByAlias || aggColumn, uxaDTO, includeOtherMaxGroups);
    },

    addProjection: function(projections, aggregation, column, alias, uniqueColumnKeys) {
        const projection = {};
        let key = '';
        if (aggregation) {
            projection[aggregation] = column;
            projection[UXAConstants.ALIAS] = alias;
            key = `${aggregation}_${column}`;
        } else {
            projection[column] = alias;
            key = `${column}`;
        }

        if (!uniqueColumnKeys.has(key)) {
            uniqueColumnKeys.add(key);
            projections.push(projection);
        }
    },

    type: 'UXADSLService'
};
