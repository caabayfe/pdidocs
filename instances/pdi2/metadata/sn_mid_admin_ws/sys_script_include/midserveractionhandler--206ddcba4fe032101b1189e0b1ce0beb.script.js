var MIDServerActionHandler = Class.create();
MIDServerActionHandler.prototype = {
    initialize: function(midSysId, action) {
        if (!midSysId) return;

        this.midSysId = midSysId;
        this.action = action ? action.toLowerCase() : '';
        this.midGr = new GlideRecord('ecc_agent');
        this.midGr.get('sys_id', this.midSysId);
        this.midExists = this.midGr.isValidRecord();
        this.response = {
            status: 'error',
            message: '',
            action: this.action,
            midServerId: this.midSysId,
            timestamp: new GlideDateTime().getDisplayValue(),
            details: {}
        };
    },

    runAction: function() {
        if (!this.midExists) {
            this.response.message = 'MID Server not found';
            return this.response;
        }

        var supportedActions = ['validate', 'rekey', 'upgrade', 'pause', 'resume', 'invalidate', 'restart', 'grab_logs', 'rotate'];
        if (supportedActions.indexOf(this.action) == -1) {
            this.response.message = 'Unsupported action: ' + this.action;
            return this.response;
        }

        if (!gs.hasRole('agent_admin') || gs.hasRole('snc_read_only')) {
            this.response.message = 'You do not have permission to perform this action';
            return this.response;
        }

        switch (this.action) {
            case 'validate':
                return this._validate();
            case 'rekey':
                return this._rekey();
            case 'upgrade':
                return this._upgrade();
            case 'pause':
                return this._pause();
            case 'resume':
                return this._resume();
            case 'invalidate':
                return this._invalidate();
            case 'restart':
                return this._restart();
            case 'grab_logs':
                return this._grabLogs();
            case 'rotate':
                return this._rotate();
        }
    },

    _validate: function() {
        if (this.midGr.validated != 'false') {
            this.response.message = 'MID Server cannot be validated as it is already validated';
            return this.response;
        }
        if (['Paused', 'Upgrading', 'Upgrade Failed', 'Draining', 'Drained', 'Drain Failed'].indexOf('' + this.midGr.status) != -1) {
            this.response.message = 'MID Server cannot be validated as it is in a non-active state';
            return this.response;
        }
        if (this.midGr.auto_invalidated == true) {
            this.response.message = 'MID Server cannot be validated as it is auto-invalidated';
            return this.response;
        }

        var midManager = new global.MIDServerManage();
        midManager.validate(this.midGr.name);
        this.response.status = 'success';
        this.response.message = 'MID Server is validating';
        return this.response;
    },

    _rekey: function() {
        if (this.midGr.is_using_custom_cert) {
            this.response.message = 'MID Server cannot be rekeyed as it is using a custom certificate';
            return this.response;
        }
        if (this.midGr.validated == 'rekey') {
            this.response.message = 'MID Server cannot be rekeyed as it is already rekeying';
            return this.response;
        }
        if (this.midGr.status != "Up") {
            this.response.message = 'MID Server cannot be rekeyed as it is not in an active state';
            return this.response;
        }

        var midManager = new global.MIDServerManage();
        midManager.rekey(this.midGr.name);
        this.response.status = 'success';
        this.response.message = 'MID Server is rekeying';
        return this.response;
    },

    _upgrade: function() {
        if (this.midGr.status != "Up" && this.midGr.status != "Upgrade Failed") {
            this.response.message = 'MID Server cannot be upgraded as it is not in an active state';
            return this.response;
        }

        var agentName = (this.midGr.name + '').replace(/'/g, "\\'");
        var midManager = new global.MIDServerManage();
        midManager.upgrade(agentName);
        this.response.status = 'success';
        this.response.message = 'MID Server is upgrading';
        return this.response;
    },

    _pause: function() {
        new global.MIDServerManage().pauseMid(this.midGr.name + '');
        this.response.status = 'success';
        this.response.message = 'MID Server is pausing';
        return this.response;
    },

    _resume: function() {
        new global.MIDServerManage().resumeMid(this.midGr.name + '');
        this.response.status = 'success';
        this.response.message = 'MID Server is resuming';
        return this.response;
    },

    _invalidate: function() {
        new global.MIDServerManage().invalidate(this.midGr.name + '');
        this.response.status = 'success';
        this.response.message = 'MID Server is invalidating';
        return this.response;
    },

    _restart: function() {
        var agentName = (this.midGr.name + '').replace(/'/g, "\\'");
        var midManager = new global.MIDServerManage();
        midManager.restartService(agentName);
        midManager.system_msg(agentName, 'load_ip_access');
        gs.addInfoMessage(gs.getMessage('Syncing IP access rules with MID server: {0}', agentName));
        this.response.status = 'success';
        this.response.message = 'MID Server is restarting';
        return this.response;
    },

    _grabLogs: function() {
        var agentName = (this.midGr.name + '').replace(/'/g, "\\'");
        var files = [
            'wrapper.log',
            'agent0.log.0',
            'mid_installer.log.0',
            'mid_installer.log.0.1',
            'dist_upgrade.log.0',
            'FileHandlerReport.txt',
            '../conf/wrapper.conf',
            '../conf/wrapper-override.conf',
            '../conf/wrapper-license.conf',
            '../conf/wrapper-jvm.conf',
            '../properties/glide.properties'
        ];
        var midManager = new global.MIDServerManage();
        midManager.threaddump(agentName);
        midManager.grab_logs(agentName, files.join(','));
        midManager.grab_settings(agentName);
        var targetUrl = 'now/itom-infra-services-workspace/mid-server/' + this.midSysId + '/params/selected-item/mid_logs';
        gs.addInfoMessage(gs.getMessage('Latest MID Server logs are now available. <a href="{0}">View logs here</a>.', [targetUrl]));
        this.response.status = 'success';
        this.response.message = 'MID Server logs grabbed';
        return this.response;
    },

    _rotate: function() {
        if (this.isIpkiMid()) {
            new sn_mid_infra.IPKIService().forceRotate(this.midSysId);
            gs.addInfoMessage(gs.getMessage('Initiating ServiceNow certificate rotation.'));
            this.response.status = 'success';
            this.response.message = 'Initiating ServiceNow certificate rotation.';
            return this.response;
        } else {
            gs.addErrorMessage(gs.getMessage('This MID Server is not enabled to use a ServiceNow certificate.'));
            this.response.message = 'This MID Server is not enabled to use a ServiceNow certificate.';
            return this.response;
        }
    },

    isIpkiMid: function () {
        return new sn_mid_infra.IPKIService().getActiveRecordByAgent(this.midSysId) !== null;
    },

    canInvalidate: function (current) {
        return new global.MIDServerManage().canInvalidate(current);
    },

    type: 'MIDServerActionHandler'
};
