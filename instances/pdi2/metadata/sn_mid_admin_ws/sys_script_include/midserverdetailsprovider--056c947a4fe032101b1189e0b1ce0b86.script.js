var MIDServerDetailsProvider = Class.create();
/**
 * MIDServerDetailsProvider
 * ------------------------
 * This Script Include provides utility methods to retrieve and evaluate key details
 * about a specific MID Server instance, including:
 *  - Version compatibility with the instance
 *  - MID Server user validation (username, role, and configuration)
 * 
 * The class determines the status and highlight color for both the MID Server version
 * and user configuration, which can be used to visually represent the health or validity
 * of the MID Server in a UI component.
 **/
MIDServerDetailsProvider.prototype = {

    initialize: function(info) {
        this.midSysId = info.sys_id || '';
        this.userName = info.user_name || '';
        this.version = info.version || '';
        this.mutualAuth = info.mutual_auth || 'false';
        //Result objects
        this.versionInfo = {
            status: 'unknown',
            highlight_color: 'low'
        };
        this.userInfo = {
            status: 'unknown',
            highlight_color: 'critical'
        };

        //Status/color enum
        this.STATUS = {
            UNKNOWN: 'unknown',
            EQUAL: 'equal',
            COMPATIBLE: 'compatible',
            INCOMPATIBLE: 'incompatible',
            VALID: 'valid',
            MISSING_ROLE: 'missing_role',
            CONFIG_MISMATCH: 'config_mismatch'
        };

        this.COLOR = {
            LOW: 'low',
            POSITIVE: 'positive',
            WARNING: 'warning',
            CRITICAL: 'critical'
        };

    },

    setVersionInfo: function() {
        var instanceVersion = gs.getProperty('mid.buildstamp', null);
        if (!instanceVersion || !this.version) {
			this._set(this.versionInfo, this.STATUS.UNKNOWN, this.COLOR.LOW);
			return this.versionInfo;
        }

        if (instanceVersion == this.version) {
			this._set(this.versionInfo, this.STATUS.EQUAL, this.COLOR.POSITIVE);
			return this.versionInfo;
        }

        var releaseRegex = /[^__]*/;
        if ('' + instanceVersion.match(releaseRegex) == '' + this.version) {
			this._set(this.versionInfo, this.STATUS.COMPATIBLE, this.COLOR.WARNING);
			return this.versionInfo;
        }

        this._set(this.versionInfo, this.STATUS.INCOMPATIBLE, this.COLOR.CRITICAL);
        return this.versionInfo;
    },

    setUserInfo: function() {
        if (!this.userName) {
			this._set(this.userInfo, this.STATUS.UNKNOWN, this.COLOR.CRITICAL);
			return this.userInfo;
        }
        var grc = new GlideRecord('ecc_agent_config');
        grc.addQuery('ecc_agent', this.midSysId);
        grc.addQuery('param_name', 'mid.instance.username');
        grc.query();
        var config_user = grc.next() ? '' + grc.getValue('value') : '';

        var matches_config = false;
        if (this.mutualAuth == 'true' || (config_user).contains("*****")) {
			matches_config = true;
		} else {
				matches_config = (this.userName.toLowerCase() == config_user.toLowerCase())
        }

        if (!matches_config) {
			this._set(this.userInfo, this.STATUS.CONFIG_MISMATCH, this.COLOR.CRITICAL);
			return this.userInfo;
        }

        const midRole = 'mid_server';
        var userSysId = this._getUserSysId();
        if (!userSysId) {
        this._set(this.userInfo, this.STATUS.UNKNOWN, this.COLOR.CRITICAL);
        return this.userInfo;
        }
        if (!this._hasRole(userSysId, midRole)) {
        this._set(this.userInfo, this.STATUS.MISSING_ROLE, this.COLOR.CRITICAL);
        return this.userInfo;
        }

        this._set(this.userInfo, this.STATUS.VALID, this.COLOR.POSITIVE);
        return this.userInfo;
    },
    
    _getUserSysId: function() {
		var userGr = new GlideRecord('sys_user');
		userGr.addQuery('user_name', this.userName);
		userGr.query();
		return userGr.next() ? userGr.getUniqueValue() : null;
    },

    _hasRole: function(user_sys_id, role) {
		if (!user_sys_id || !role)
		return false;
		var roleGr = new GlideRecord('sys_user_has_role');
		roleGr.addQuery('user', user_sys_id);
		roleGr.addQuery('role.name', role);
		roleGr.setLimit(1);
		roleGr.query();
		return roleGr.hasNext();
	},
	
    _set: function(obj, status, color) {
		obj.status = status;
		obj.highlight_color = color;
    },

    type: 'MIDServerDetailsProvider'
};
