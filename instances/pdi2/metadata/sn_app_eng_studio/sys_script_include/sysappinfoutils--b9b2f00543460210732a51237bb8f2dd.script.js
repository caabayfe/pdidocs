var SysAppInfoUtils = Class.create();
SysAppInfoUtils.prototype = {
    initialize: function(applicationSysId) {
        var sysAppInfoGr = new GlideRecord('sys_app_info');
        var isSysAppInfoGrFound = sysAppInfoGr.get('sys_scope', applicationSysId);

		this.sysAppInfoGr = sysAppInfoGr;

        if (isSysAppInfoGrFound) {
            this.properties = this._getSysAppInfoProperties();
        } else {
			this.properties = {};
		}
    },

    getIsSourceApp: function() {
        return this.properties?.origin === 'create_from_scratch';
    },

    getIsGeneratedFromAI: function() {
        return this.properties?.generated_using_ai === 'true';
    },

    getIsFileGeneratedFromAI: function(fileSysId) {
        var sysIds = this._getAIGeneratedSysIds();
        return sysIds.includes(fileSysId);
    },

    getIsFileInReview: function(fileSysId) {
        var sysIds = this._getSysIdsInReview();
        return sysIds.includes(fileSysId);
    },

    getIsItemInList: function(property, item) {
        var currentList = this.properties[property] ? JSON.parse(this.properties[property]) : [];
        var index = currentList.indexOf(item);

        if (index > -1) {
            return true;
        }

        return false;
    },

    removeItemFromList: function(property, item) {
        try {
            var currentList = this.properties[property] ? JSON.parse(this.properties[property]) : [];
            var index = currentList.indexOf(item);

            if (index > -1) {
                currentList.splice(index, 1);
                this._updateSysAppInfoProperty(property, JSON.stringify(currentList));
            }

        } catch (ex) {
            gs.info('SysAppInfoUtils.updateListProperty Unable to update property: ' + property);
            gs.info('SysAppInfoUtils.exception: ' + ex);
        }
    },

    _getAIGeneratedSysIds: function() {
        var jsonArray = this.properties?.ai_sysids || '[]';
        try {
            return JSON.parse(jsonArray);
        } catch (ex) {
            gs.info('SysAppInfoUtils._getAIGeneratedSysIds Unable to parse jsonArray: ' + jsonArray);
            gs.info('SysAppInfoUtils._getAIGeneratedSysIds ex: ' + ex);
            return [];
        }
    },

    _getSysIdsInReview: function() {
        var jsonArray = this.properties?.ai_sysids_unreviewed || '[]';
        try {
            return JSON.parse(jsonArray);
        } catch (ex) {
            gs.info('SysAppInfoUtils._getSysIdsInReview Unable to parse jsonArray: ' + jsonArray);
            gs.info('SysAppInfoUtils._getSysIdsInReview ex: ' + ex);
            return [];
        }
    },

    _getSysAppInfoProperties: function() {
        try {
            var properties = this.sysAppInfoGr.getValue('properties');
            result = JSON.parse(properties);
            return result;
        } catch (ex) {
            gs.info('SysAppInfoUtils._getSysAppInfoProperties ex: ' + ex);
            return {};
        }
    },

    _updateSysAppInfoProperty: function(property, value) {
        try {
            if (typeof(value) !== 'string') {
                gs.info('SysAppInfoUtils._updateSysAppInfoProperty Unable to update property: ' + property + ' value must be a string');
                return;
            }

            this.properties[property] = value;
            this._updateSysAppInfoProperties(this.properties);
        } catch (ex) {
            gs.info('SysAppInfoUtils._updateSysAppInfoProperty Unable to update property: ' + property);
            gs.info('SysAppInfoUtils._updateSysAppInfoProperty ex: ' + ex);
        }
    },

    _updateSysAppInfoProperties: function(properties) {
        try {
            this.sysAppInfoGr.setValue('properties', JSON.stringify(properties));
            var recordSysId = this.sysAppInfoGr.update();

            if (!recordSysId) {
                gs.info('SysAppInfoUtils._updateSysAppInfoProperties glide record update not successful');
            }

        } catch (ex) {
            gs.info('SysAppInfoUtils._updateSysAppInfoProperties Unable to update properties');
            gs.info('SysAppInfoUtils._updateSysAppInfoProperties ex: ' + ex);
        }
    },

    type: 'SysAppInfoUtils'
};
