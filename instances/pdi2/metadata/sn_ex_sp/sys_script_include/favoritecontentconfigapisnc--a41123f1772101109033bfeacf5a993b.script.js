var FavoriteContentConfigAPISNC = Class.create();
FavoriteContentConfigAPISNC.prototype = {
    initialize: function(isMobile, contentType, $sp) {
        this.IS_MOBILE = isMobile;
        this.CONFIGS = {};
        this.$sp = $sp;
        this.KBCommonAPI = new sn_ex_sp.KBCommonAPI();

        var favoriteConfig = new GlideRecord('sn_ex_sp_favorite_content_config');
        favoriteConfig.addActiveQuery();
        favoriteConfig.addQuery('favorite_content_type.active', 'true');
        if (contentType) {
            if (contentType == "ISEMPTY") {
                favoriteConfig.addEncodedQuery('favorite_content_typeISEMPTY');
            } else {
                favoriteConfig.addQuery('favorite_content_type', 'IN', contentType);
            }
        }
        if (isMobile) {
            var mobileFilter = favoriteConfig.addQuery('availability', 'mobile');
            mobileFilter.addOrCondition('availability', 'both');
        } else {
            var desktopFilter = favoriteConfig.addQuery('availability', 'portal');
            desktopFilter.addOrCondition('availability', 'both');
        }
        favoriteConfig.orderBy('table');
        favoriteConfig.orderBy('order');
        favoriteConfig.query();
        while (favoriteConfig.next()) {
            var table = favoriteConfig.getValue('table');
            var config = {};
            config['sys_id'] = favoriteConfig.getValue('sys_id');
            config['availability'] = favoriteConfig.getValue('availability');
            config['condition'] = favoriteConfig.getValue('condition');
            config['external_navigation_type'] = favoriteConfig.getValue('external_navigation_type');
            config['favorite_content_type'] = favoriteConfig.getValue('favorite_content_type');
            config['field'] = favoriteConfig.getValue('field');
            config['image'] = favoriteConfig.getValue('image');
            config['image_url'] = favoriteConfig.getValue('image_url');
            config['navigation_type'] = favoriteConfig.getValue('navigation_type');
            config['order'] = favoriteConfig.getValue('order');
            config['portal_page'] = favoriteConfig.getValue('portal_page');
            config['primary_display'] = favoriteConfig.getValue('primary_display');
            config['secondary_display'] = favoriteConfig.getValue('secondary_display');
            config['table'] = table;
            config['specify_portal_page'] = favoriteConfig.getValue('specify_portal_page');
            config['url'] = favoriteConfig.getValue('url');
            config['url_parameters'] = favoriteConfig.getValue('url_parameters');

            if (!this.CONFIGS[table]) {
                this.CONFIGS[table] = [];
            }
            this.CONFIGS[table].push(config);
        }
    },

    /**
     * Checks if a record can be associated to any of the configurations for favorite.
     * @param {String} table 
     * @param {String} recordId 
     * @returns true/false
     */
    isRecordConfigured: function(table, recordId) {
        var recordGr = new GlideRecord(table);
        if (recordGr.isValid() && recordGr.get(recordId) && FavoriteSecurityUtil.canView(recordGr, this.IS_MOBILE)) {
            var result = this.getConfig(table, recordId) ? true : false;
            return result;
        }
        return false;
    },

    /**
     * Returns list of eligible tables based on favorite configurations.
     * @returns list
     */
    getConfigTables: function() {
        var configTables = [];
        var parentTables = Object.keys(this.CONFIGS);
        for (var i = 0; i < parentTables.length; i++) {
            var childTables = this._getChildTables(parentTables[i]);
            for (var j = 0; j < childTables.length; j++) {
                if (configTables.length) {
                    if (configTables.indexOf(childTables[j]) < 0) {
                        configTables.push(childTables[j]);
                    }
                } else {
                    configTables.push(childTables[j]);
                }
            }
        }
        return configTables;
    },

    /**
     * Sample input -
     *.  {
     *.   "sc_cat_item":[{fav_sys_id:"",sys_id:""}...]
     *   }
     * Returns a response object which contains data of all favorite items segregated by favorite type.
     * @param {JSON} input 
     * @returns {JSON}
     */
    applyConfig: function(input) {
        var response = [];

        var favContentTypeGr = new GlideRecord('sn_ex_sp_favorite_content_type');
        favContentTypeGr.addActiveQuery();
        favContentTypeGr.query();
        var favContentType = {};
        while (favContentTypeGr.next()) {
            var id = favContentTypeGr.getUniqueValue();
            var contentType = {
                'badge_icon': ''
            };
            contentType['badge_icon'] = favContentTypeGr.getValue('badge_icon');
            favContentType[id] = contentType;
        }

        for (var favoriteItem in input) {
            var table = favoriteItem;
            var records = input[table];
            for (var i = 0; i < records.length; i++) {
                var config = this.getConfig(table, records[i]['sys_id']);
                if (config) {
                    var recordGr = new GlideRecord(config['table']);
                    if (recordGr.get(records[i]['sys_id'])) {
                        var recordObj = {};
                        recordObj['sys_id'] = records[i]['sys_id'];
                        recordObj['favorite_id'] = records[i]['fav_sys_id'];
                        recordObj['sys_updated_on'] = records[i]['sys_updated_on'];
                        recordObj['table_name'] = records[i]['table_name'];
                        recordObj['category'] = config['favorite_content_type'];
                        recordObj['badge_icon'] = favContentType[config['favorite_content_type']]['badge_icon'];
                        recordObj['is_mobile'] = this.IS_MOBILE;
                        recordObj['sys_created_on'] = records[i]['sys_created_on'];
                        recordObj['last_viewed'] = records[i]['last_viewed'];
                        this._populateView(config, recordGr, recordObj);
                        this._populateUrl(config, recordGr, recordObj);
                        response.push(recordObj);
                    }
                }
            }
        }
        return response;
    },

    /**
     * Returns a config which best fits the input record.
     * @param {String} table 
     * @param {String} recordId 
     * @returns {Object}
     */
    getConfig: function(table, recordId) {
        var defConfig = '';
        var hierarchyTables = [];
        hierarchyTables = this._getParentTables(table);
        for (var i = 0; i < hierarchyTables.length; i++) {
            var favoriteConfigs = this._getConfigRecords(hierarchyTables[i]);
            var applicableConfig = this._getApplicableConfig(favoriteConfigs, recordId);
            if (applicableConfig) {
                return applicableConfig;
            }
        }
        return defConfig;
    },

    /**
     * Returns all configs present for an input table.
     * @param {String} table 
     * @returns {list}
     */
    _getConfigRecords: function(table) {
        if (this.CONFIGS[table]) {
            return this.CONFIGS[table];
        }
        return [];
    },

    /**
     * Validates all configs for the input record and returns if validated. 
     * @param {Array} favoriteConfigs 
     * @param {String} recordId 
     * @returns 
     */
    _getApplicableConfig: function(favConfigs, recordId) {
        for (var i = 0; i < favConfigs.length; i++) {
            var condition = favConfigs[i]['condition'];
            if (!condition) {
                return favConfigs[i];
            } else {
                var tableGr = new GlideRecord(favConfigs[i]['table']);
                tableGr.addQuery('sys_id', recordId);
                tableGr.addEncodedQuery(condition);
                tableGr.query();
                if (tableGr.hasNext()) {
                    return favConfigs[i];
                }
            }
        }
        return '';
    },


    /**
     * Returns list of parent tables in order along with input table.
     * @param {String} table 
     * @returns {String}
     */
    _getParentTables: function(table) {
        var tableHierarchy = new GlideTableHierarchy(table);
        var parentTables = tableHierarchy.getTables();
        return parentTables;
    },

    /**
     * Returns list all tables in child hierarchy along with input table.
     * @param {String} table 
     * @returns {String}
     */
    _getChildTables: function(table) {
        var childTables = [];
        var tableHierarchy = new GlideTableHierarchy(table);
        childTables = tableHierarchy.getAllExtensions();
        return childTables;
    },

    _getDisplayValue: function(recordGr, field) {
        if (recordGr.getTableName() === 'kb_knowledge' && field === 'text') {
            var kbContent = this.KBCommonAPI.getKBContent(recordGr);
            return kbContent;
        } else {
            return recordGr.getDisplayValue(field);
        }
    },

    /**
     * Populates display related fields of favorite item in response object.
     * @param {Object} favoriteConfig 
     * @param {GlideRecord} recordGr 
     * @param {JSON} response 
     */
    _populateView: function(favoriteConfig, recordGr, response) {
        var primaryDisplay = this._getDisplayValue(recordGr, favoriteConfig['primary_display']);
        response['primary_display'] = primaryDisplay ? (this.$sp ? this.$sp.stripHTML(primaryDisplay) : primaryDisplay) : '';
        var secondaryDisplay = favoriteConfig['secondary_display'];
        secondaryDisplayFields = secondaryDisplay ? secondaryDisplay.split(',') : [];
        secondaryDisplayValues = [];
        for (i = 0; i < secondaryDisplayFields.length; i++) {
            var value = this._getDisplayValue(recordGr, secondaryDisplayFields[i]);
            if (value) {
                value = this.$sp ? this.$sp.stripHTML(value) : value;
                secondaryDisplayValues.push(value);
            }
        }
        response['secondary_display'] = secondaryDisplayValues.join(' , ');
        var image = recordGr.getDisplayValue(favoriteConfig['image']);
        response['fav_image'] = image ? image.substr(0, image.length - 4) : '';
        response['fav_image_url'] = recordGr.getDisplayValue(favoriteConfig['image_url']);
    },

    /**
     * Populates navigation url of a favorite item in response object.
     * @param {Object} favoriteConfig 
     * @param {GlideRecord} recordGr 
     * @param {JSON} response 
     */
    _populateUrl: function(favoriteConfig, recordGr, response) {
        var url = '';
        var target = '';
        var params = '';
        var navType = favoriteConfig['navigation_type'];
        var derivePortalPage = favoriteConfig['specify_portal_page'];
        if (navType === 'internal') {
            if(derivePortalPage === 'field') {
                var portalPageField = favoriteConfig['field'];
                favoriteConfig['portal_page'] = recordGr.getValue(portalPageField);
            }
            var portalPage = new GlideRecord('sp_page');
            if (portalPage.get(favoriteConfig['portal_page'])) {
                url += "?"+('id=' + portalPage.getValue('id'));
                params = this._createParamList(favoriteConfig, recordGr);
                url += (params ? ('&' + params) : '');
            }

        } else if (navType === 'external') {
            target = '_blank';
            var extNavType = favoriteConfig['external_navigation_type'];
            if (extNavType === 'field') {
                url += recordGr.getValue(favoriteConfig['field']);
            } else if (extNavType === 'url') {
                url += favoriteConfig['url'];
                params = this._createParamList(favoriteConfig, recordGr);
                url += params ? ('?' + params) : '';
            }
        }
        response['url'] = url;
        response['target'] = target;
    },

    /**
     * Returns parameter list to be appended in url.
     * @param {Object} favConfig
     * @param {GlideRecord} recordGr 
     * @returns {String}
     */
    _createParamList: function(favConfig, recordGr) {
        var paramList = '';
        var regExp = /[{]{2}[\w]*[}]{2}/;
        var count = 0;
        var paramString = favConfig['url_parameters'];
        var paramObj = JSON.parse(paramString);
        for (var name in paramObj) {
            if (name && name.toString().trim()) {
                if (count != 0) {
                    paramList += '&';
                }
                paramList += name.toString().trim() + '=';
                var value = paramObj[name];
                value = value ? value.toString().trim() : '';
                /** 
                 * Temporary Fix - Start
                 * Issue - When enclosing URL parameters with {{}} , a special character \u200b (zero-width-space) is getting inserted.
                 * Following is a temporary fix to remove that special character until platform defect is fixed.
                 */
                if (value) {
                    var encodedValue = encodeURI(value);
                    encodedValue = encodedValue.replaceAll('%E2%80%8B', '');
                    value = decodeURI(encodedValue);
                }
                /**
                 * Temporary Fix - End
                 */
                if (regExp.test(value)) {
                    var fieldName = value.replace(/^{+|}+$/g, '');
                    var fieldValue = recordGr.getValue(fieldName);
                    paramList += (fieldValue ? fieldValue : '');
                } else {
                    paramList += value;
                }
                count++;
            }
        }
        return paramList;
    },

    /*
     * Returns whether favorite has been enabled for a content type.
     * @returns {Boolean}
     */
    isContentTypeEnabled: function() {
        if (this.CONFIGS === '') {
            return false;
        }
        return false;
    },

    /**
     * Returns the favorite config navigation url for a given table and recordId
     * @param {String} table
     * @param {String} recordId
     * @returns {String} url
     */
    getConfigUrl: function(table, recordId) {
        var response = [];
        var recordGr = new GlideRecord(table);
        if (!recordGr.isValid() || !recordGr.get(recordId) || !FavoriteSecurityUtil.canView(recordGr, this.IS_MOBILE)) {
            return "";
        }
        var favoriteConfig = this.getConfig(table, recordId);
        this._populateUrl(favoriteConfig, recordGr, response);
        return response['url'];
    },

    type: 'FavoriteContentConfigAPISNC'
};
