/*
 *   Sample usage -
 *   var params = sn_analytics_api.ParamsBuilder.addParams().withPlatform('chat').withEventType('Topic').build()
 */

var ParamsBuilder = (function() {
    return {
        addParams: function() {
            var params = {};
            var builder = {
                // Expected date format of fromDate is yyyy-MM-dd
                withFromDate: function(fromDate) {
                    this._addParam(AnalyticsAPIMetadata.Params.FROM_DATE, fromDate);
                    return builder;
                },
                // Expected date format of toDate is yyyy-MM-dd
                withToDate: function(toDate) {
                    this._addParam(AnalyticsAPIMetadata.Params.TO_DATE, toDate);
                    return builder;
                },

                withPlatform: function(platform) {
                    this._addParam(AnalyticsAPIMetadata.Params.PLATFORM, platform);
                    return builder;
                },

                withAllowStatistical: function(allowStatistical) {
                    this._addParam(AnalyticsAPIMetadata.Params.ALLOW_STATISTICAL, allowStatistical);
                    return builder;
                },

                withPropertyClassifier: function(classifier) {
                    this._addParam(AnalyticsAPIMetadata.Params.PROPERTY_CLASSIFIER, classifier);
                    return builder;
                },

                withAppVersion: function(appVersion) {
                    this._addParam(AnalyticsAPIMetadata.Params.APP_VERSION, appVersion);
                    return builder;
                },

                withDateBucket: function(dateBucket) {
                    this._addParam(AnalyticsAPIMetadata.Params.DATE_BUCKET, dateBucket);
                    return builder;
                },

                withEventTypeFilter: function(eventTypeFilter) {
                    this._addParam(AnalyticsAPIMetadata.Params.EVENT_TYPE_FILTER, eventTypeFilter);
                    return builder;
                },

                withEventType: function(eventType) {
                    this._addParam(AnalyticsAPIMetadata.Params.EVENT_TYPE, eventType);
                    return builder;
                },

                withEventName: function(eventName) {
                    this._addParam(AnalyticsAPIMetadata.Params.EVENT_NAME, eventName);
                    return builder;
                },

                withEventNameFilter: function(eventNameFilter) {
                    this._addParam(AnalyticsAPIMetadata.Params.EVENT_NAME_FILTER, eventNameFilter);
                    return builder;
                },

                withEventPropertyName: function(eventPropertyName) {
                    this._addParam(AnalyticsAPIMetadata.Params.EVENT_PROPERTY_NAME, eventPropertyName);
                    return builder;
                },

                withPropertyName: function(propertyName) {
                    this._addParam(AnalyticsAPIMetadata.Params.PROPERTY_NAME, propertyName);
                    return builder;
                },

                withDynamicPropertyName: function(dynamicPropertyName) {
                    this._addParam(AnalyticsAPIMetadata.Params.DYNAMIC_PROPERTY_NAME, dynamicPropertyName);
                    return builder;
                },

                withPropertyNameFilter: function(propertyNameFilter) {
                    this._addParam(AnalyticsAPIMetadata.Params.PROPERTY_NAME_FILTER, propertyNameFilter);
                    return builder;
                },

                withPropertyValueFilter: function(propertyValueFilter) {
                    this._addParam(AnalyticsAPIMetadata.Params.PROPERTY_VALUE_FILTER, propertyValueFilter);
                    return builder;
                },

                withQuery: function(query) {
                    this._addParam(AnalyticsAPIMetadata.Params.QUERY, query);
                    return builder;
                },

                withPageSize: function(pageSize) {
                    this._addParam(AnalyticsAPIMetadata.Params.PAGE_SIZE, pageSize);
                    return builder;
                },

                withPageNum: function(pageNum) {
                    this._addParam(AnalyticsAPIMetadata.Params.PAGE_NUM, pageNum);
                    return builder;
                },

                withSortField: function(sortField) {
                    this._addParam(AnalyticsAPIMetadata.Params.SORT_FIELD, sortField);
                    return builder;
                },

                withSortDirection: function(sortDirection) {
                    this._addParam(AnalyticsAPIMetadata.Params.SORT_DIRECTION, sortDirection);
                    return builder;
                },

                withUserId: function(userId) {
                    this._addParam(AnalyticsAPIMetadata.Params.USER_ID, userId);
                    return builder;
                },

                withIncludeDeleted: function(includeDeleted) {
                    this._addParam(AnalyticsAPIMetadata.Params.INCLUDE_DELETED, includeDeleted);
                    return builder;
                },

                withSessionId: function(sessionId) {
                    this._addParam(AnalyticsAPIMetadata.Params.SESSION_ID, sessionId);
                    return builder;
                },

                withIsFavorite: function(isFavorite) {
                    this._addParam(AnalyticsAPIMetadata.Params.IS_FAVORITE, isFavorite);
                    return builder;
                },

                withCountry: function(country) {
                    this._addParam(AnalyticsAPIMetadata.Params.COUNTRY, country);
                    return builder;
                },

                withRegions: function(regions) {
                    this._addParam(AnalyticsAPIMetadata.Params.REGIONS, regions);
                    return builder;
                },

                withFunnelId: function(funnelId) {
                    this._addParam(AnalyticsAPIMetadata.Params.FUNNEL_ID, funnelId);
                    return builder;
                },

                withOptions: function(options) {
                    this._addParam(AnalyticsAPIMetadata.Params.OPTIONS, options);
                    return builder;
                },

                withNextPageToken: function(nextPageToken) {
                    this._addParam(AnalyticsAPIMetadata.Params.BATCH_ID, nextPageToken);
                    return builder;
                },

                withScreenType: function(screenType) {
                    this._addParam(AnalyticsAPIMetadata.Params.SCREEN_TYPE, screenType);
                },

                withFunnelName: function(funnelName) {
                    this._addParam(AnalyticsAPIMetadata.Params.FUNNEL_NAME, funnelName);
                    return builder;
                },

                withSteps: function(steps) {
                    this._addParam(AnalyticsAPIMetadata.Params.STEPS, steps);
                    return builder;
                },

                // Expected values [Now, Week, Month, ThreeMonths] = range(4)
                withDateInterval: function(dateInterval) {
                    this._addParam(AnalyticsAPIMetadata.Params.DATE_INTERVAL, dateInterval);
                    return builder;
                },

                build: function() {
                    return params;
                },

                _addParam: function(paramInfo, paramVal) {
                    if (params.VALIDATION_STATUS == 'FAIL')
                        return;

                    var paramValidation = this._isValid(paramInfo, paramVal);
                    if (paramValidation.status == 'FAIL') {
                        params = {};
                        params.VALIDATION_STATUS = 'FAIL';
                        params.VALIDATION_STATUS_MESSAGE = paramValidation.message;
                        return;
                    }

                    var paramType = paramInfo.type;

                    if (paramType == 'string' || paramType == 'number' || paramType == 'boolean' || paramType == 'array')
                        params[paramInfo.name] = paramVal;
                    else if (paramType == 'date') {
                        var format = paramInfo.format;
                        var gdt = new GlideDateTime(paramVal);
                        params[paramInfo.name] = gdt.getDate().getValue();
                    } else if (paramType == 'json') {
                        try {
                            params[paramInfo.name] = JSON.parse(paramVal);
                        } catch (e) {
                            params = {};
                            params.VALIDATION_STATUS = 'FAIL';
                            params.VALIDATION_STATUS_MESSAGE = 'Invalid json - ' + paramInfo.name;
                            return;
                        }
                    }
                },

                _isValid: function(paramInfo, paramVal) {
                    var paramName = paramInfo.name;
                    var paramType = paramInfo.type;

                    if (!this._isValidType(paramType, paramVal))
                        return {
                            status: 'FAIL',
                            message: paramName + ' has to be a valid ' + paramType
                        };

                    var validValues = paramInfo.valid_values;
                    if (!this._isValidValue(validValues, paramVal))
                        return {
                            status: 'FAIL',
                            message: paramName + ' has to be one of ' + validValues.toString()
                        };

                    return {
                        status: 'PASS',
                    };
                },

                _isValidType: function(paramType, paramVal) {
                    if (paramType == 'string' || paramType == 'number' || paramType == 'boolean') {
                        return typeof paramVal == paramType;
                    } else if (paramType == 'date') {
                        var gdt = new GlideDateTime(paramVal);
                        return gdt.isValid();
                    } else
                        return true;
                },

                _isValidValue: function(validValues, paramVal) {
                    if (validValues)
                        return new global.ArrayUtil().contains(validValues, paramVal);

                    return true;
                }
            };

            return builder;
        }
    };
})();
