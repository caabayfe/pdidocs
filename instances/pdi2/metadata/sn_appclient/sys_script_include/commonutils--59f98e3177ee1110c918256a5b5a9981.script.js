    var CommonUtils = {

        getSearchType: function(searchExpression) {
            return searchExpression && searchExpression.startsWith(Constants.SEARCH_FOR_EXACT_MATCH_PREFIX) ? Constants.SEARCH_FOR_EXACT_MATCH : Constants.SEARCH_FOR_CONTAINS;
        },

        getSearchKeyword: function(searchExpression) {
            return searchExpression && (searchExpression.startsWith(Constants.SEARCH_FOR_EXACT_MATCH_PREFIX) || searchExpression.startsWith(Constants.SEARCH_FOR_CONTAINS_PREFIX)) ? searchExpression.substring(1) : searchExpression;
        },

        getEscapedRegExp: function(str) {
            //Escaping regex -> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
            return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        },

        getEncodedQueryFromExpression: function(searchExpression, columnName) {
            var searchType = this.getSearchType(searchExpression);
            var keyword = this.getSearchKeyword(searchExpression);

            return (searchType == Constants.SEARCH_FOR_EXACT_MATCH) ? columnName + '=' + keyword : columnName + 'LIKE' + keyword;
        },

        appendEncodedQueryFromproductFamily: function(searchExpression, encodedQuery, productFamily) {
            if (productFamily != null && productFamily.length > 0)
                for (i = 0; i < productFamily.length; i++) {
                    if (i > 0) encodedQuery += "^OR";
                    else if (searchExpression) encodedQuery += "^";
                    encodedQuery += "family=" + productFamily[i];
                }
            return encodedQuery;
        },

        /**
         * Returns array adhering to limit, and offset
         * @param array
         * @param queryParams
         * @returns [*]
         */
        getResultByParams: function(array, queryParams) {
            var limit = this.getLimit(queryParams);
            var offset = this.getOffset(queryParams);
            return array.slice(offset, offset + limit);
        },

        isPaginationRequest: function(queryParams) {
            return queryParams[Constants.SYSPARM_OFFSET] ? true : false;
        },

        isPureInteger: function(value) {
            return value % 1 == 0;
        },

        getLimit: function(queryParams) {
            var limit = (queryParams[Constants.SYSPARM_LIMIT] || gs.getProperty("sn_appclient.max_record_limit", Constants.MAX_RECORD_LIMIT)) * 1;
            if (!this.isPureInteger(limit)) {
                throw this.getErrorObject(ResponseMessage.getInvalidValue(Constants.SYSPARM_LIMIT),
                    ResponseMessage.getInvalidInteger(Constants.SYSPARM_LIMIT, queryParams[Constants.SYSPARM_LIMIT]));
            }
            if (limit <= 0) {
                throw this.getErrorObject(ResponseMessage.getInvalidValue(Constants.SYSPARM_LIMIT),
                    ResponseMessage.getInvalidNaturalNumberRange(Constants.SYSPARM_LIMIT, queryParams[Constants.SYSPARM_LIMIT]));
            }
            return limit;
        },

        getOffset: function(queryParams) {
            var offset = (queryParams[Constants.SYSPARM_OFFSET] || 0) * 1;
            if (!this.isPureInteger(offset)) {
                throw this.getErrorObject(ResponseMessage.getInvalidValue(Constants.SYSPARM_OFFSET),
                    ResponseMessage.getInvalidInteger(Constants.SYSPARM_OFFSET, queryParams[Constants.SYSPARM_OFFSET]));
            }
            if (offset < 0) {
                throw this.getErrorObject(ResponseMessage.getInvalidValue(Constants.SYSPARM_OFFSET),
                    ResponseMessage.getInvalidWholeNumberRange(Constants.SYSPARM_OFFSET, queryParams[Constants.SYSPARM_OFFSET]));
            }
            return offset;
        },

        getBooleanParam: function(queryParams, key) {
            var value = queryParams[key];
            if (value && value != 'true' && value != 'false') {
                throw this.getErrorObject(ResponseMessage.getInvalidValue(key),
                    ResponseMessage.getInvalidBooleanRange(key, queryParams[key]));
            }
            return value == 'true';
        },

        getProductSource: function(queryParams) {
            var source = queryParams[Constants.SOURCE];

            if (source != Constants.PLATFORM && source != Constants.STORE) {
                throw this.getErrorObject(ResponseMessage.getInvalidValue(Constants.SOURCE),
                    ResponseMessage.getInvalidProductSource(Constants.SOURCE, queryParams[Constants.STORE]));
            }
            return source;
        },

        getErrorObject: function(message, detail, status) {
            return {
                errorDescription: message,
                errorAction: detail,
                errorCode: status || 400
            };
        },

        getValues: function(map) {
            var array = [];
            for (var key in map) {
                array.push(map[key]);
            }
            return array;
        },

        getUnionOfProducts: function(products, productsForFilters) {
            var unique = {};
            var concatArrays = [];
            for (var i = 0; i < products.length; i++) {
                if (!unique[products[i].productId]) {
                    unique[products[i].productId] = true;
                    concatArrays.push(products[i]);
                }
            }
            for (var j = 0; j < productsForFilters.length; j++) {
                if (!unique[productsForFilters[j].productId]) {
                    unique[productsForFilters[j].productId] = true;
                    concatArrays.push(productsForFilters[j]);
                }
            }
            return concatArrays;
        },
        getCommonProducts: function(products, productsForFilters) {
            var commonProducts = [];
            var hashMap = {};
            for (var i = 0; i < products.length; i++)
                hashMap[products[i].productName] = 1;
            for (i = 0; i < productsForFilters.length; i++)
                if (!hashMap[productsForFilters[i].productName])
                    commonProducts.push(productsForFilters[i]);
            return commonProducts;
        },

        getInstalledVersion: function(sourceAppId) {
            var gr = new GlideRecord(Constants.TABLE_SYS_STORE_APP);
            gr.addQuery(Constants.SYS_ID, sourceAppId);
            gr.query();
            return gr.next() ? gr.getValue(Constants.VERSION) : '';
        },

        getInstalledCustomizationVersion: function(sourceAppId) {
            var gr = new GlideRecord(Constants.TABLE_SYS_APP_CUSTOMIZATION);
            gr.addQuery(Constants.VENDOR_APP, sourceAppId);
            gr.query();
            return gr.next() ? gr.getValue(Constants.VERSION) : '';
        },

        addProgressTracker: function(payload, trackerPayload, appId, type, mode) {
            if (!(trackerPayload && trackerPayload.trackerId)) {
                gs.info('tracker id not available to track the activity')
                return;
            }
            var gr = new GlideRecord(Constants.TABLE_PROGRESS_TRACKER);
            gr.setValue("tracker_id", trackerPayload.trackerId);
            gr.setValue("app_id", appId);
            var name;
            if (mode == Constants.UNINSTALL)
                name = payload.name;
            else if (type == Constants.APPLICATION)
                name = this.getAppNameBySourceAppId(appId);
            else if (type == Constants.PLUGIN)
                name = this.getPluginNameById(appId);
            else
                name = payload.name;
            gr.setValue('name', name);
            gr.setValue("message", "Pending");
            gr.setValue("type", type);
            gr.setValue("mode", mode);
            gr.setValue("payload", this.stringify(payload));
            gr.setValue("tracker_payload", this.stringify(trackerPayload));
            gr.setValue("state", "0");
            gr.insert();
        },

        getAppNameBySourceAppId: function(sourceAppId) {
            var gr = new GlideRecord(Constants.TABLE_SYS_STORE_APP);
            if (gr.get(sourceAppId))
                return gr.getValue('name');

            gr = new GlideRecord(Constants.TABLE_SYS_REMOTE_APP);
            gr.addQuery('source_app_id', sourceAppId);
            gr.query();
            if (gr.next())
                return gr.getValue("name");

            return null;
        },

        getPluginNameById: function(pluginId) {
            gr = new GlideRecord(Constants.TABLE_V_PLUGIN);
            gr.addQuery('id', pluginId);
            gr.query();
            if (gr.next())
                return gr.getValue('name');
            return null;
        },

        getProductNameById: function(productId) {
            gr = new GlideRecord(Constants.TABLE_PRODUCT);
            gr.addQuery('id', productId);
            gr.query();
            if (gr.next())
                return gr.getValue('name');
            return null;
        },

        parse: function(input) {
            if (Object.prototype.toString.call(input) == '[object String]') return JSON.parse(input);
            return input;
        },

        stringify: function(input) {
            if (Object.prototype.toString.call(input) !== '[object String]') return JSON.stringify(input);
            return input;
        },

        setSystemProperty: function(systemProperty, key, value) {
            var gr = new GlideRecord(Constants.TABLE_SYS_PROPERTIES);
            gr.addQuery("name", systemProperty);
            gr.query();
            if (gr.next()) {
                gr.setValue(key, value);
                gr.setWorkflow(false);
                gr.update();
            }
        },

        getSystemProperty: function(systemProperty, key) {
            var gr = new GlideRecord(Constants.TABLE_SYS_PROPERTIES);
            gr.addQuery("name", systemProperty);
            gr.query();
            if (gr.next()) {
                return gr.getValue(key) || '';
            }
        },

      getAppVersionType: function(version) {
          if (gs.nil(version)) {
              return '';
          }
          var appVersion = version.toLowerCase();
          if (appVersion.includes('-rc')) {
              return 'RELEASE_CANDIDATE';
          } else if (appVersion.includes('-')) {
              return 'SNAPSHOT';
          } else {
              return 'RELEASE';
          }
      },

        formatScheduleDetailsStartTime: function(scheduleDetails, key) {
            if (scheduleDetails && key && scheduleDetails.hasOwnProperty(key)) {
                var startTime = scheduleDetails[key].start_time;
                if (startTime) {
                    var glideDateTime = new GlideDateTime(startTime);
                    glideDateTime.setDisplayValue(startTime);
                    scheduleDetails[key].start_time_ui = glideDateTime ? glideDateTime.getDisplayValueLang("medium") : "";
                    scheduleDetails[key].start_date_default_format = glideDateTime ? glideDateTime.getLocalDate().getByFormat("yyyy-MM-dd") : "";
                    scheduleDetails[key].start_time_default_format = glideDateTime ? glideDateTime.getLocalTime().getByFormat("HH:mm:ss") : "";
                }
            }
            return scheduleDetails;
        },

        getLicenseColumn: function() {
            //returns license column to populate subscription based on subscription management schema (SMv1/Smv2)
            return sn_lef.GlideEntitlement.canRouteToEMS() ? "subscription_entitlement" : "license";
        },

        type: 'CommonUtils'
    };
