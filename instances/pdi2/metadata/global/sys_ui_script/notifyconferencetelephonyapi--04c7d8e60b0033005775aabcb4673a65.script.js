NotifyOnTaskClient.registerServiceProvider((function () {
    /**
     * @typedef {{
                notifyParticipantId?: string,
                id: string,
                name: string,
                phoneNumber?: string,
                email?: string
                users?: Array<{
                    notifyParticipantId?: string,
                    id: string,
                    name: string,
                    phoneNumber?: string,
                    email?: string
                }>
            }} ParticipantInfo
     */
    /**
     * @typedef {{
                serviceProvider?: string,
                table: string,
                sysId: string,
                confId?: string,
                addToWorkNotes?: boolean,
                allowMulticonference?: boolean,
                message?: string,
                isNewConference?: boolean,
                fromNumber?: string,
                items?: Array<ParticipantInfo>
            }} ConferenceInputData
*/
    /**
     * @typedef {{
                status: boolean, errorMessages: Array<string>,
                warnMessages: Array<string>,
                successMessages: Array<string>,
                details: {[key: string]: any;}
            }} ConferenceActionResult
     */
    /**
     * @typedef {{isSupported?: number, meta?: any}} Capability
     */
    /**
     * @typedef {{
                start?: Capability,
                end?: Capability,
                selfJoin?: Capability,
                join?: Capability,
                multiJoin?: Capability,
                multiMute?: Capability,
                mute?: Capability,
                multiMute?: Capability,
                unmute?: Capability,
                multiUnmute?: Capability,
                kick?: Capability,
                multiKick?: Capability,
                speaking?: Capability,
                screenSharing?: Capability,
                archive?: Capability,
                muteOnJoin?: Capability,
                beepOnJoin?: Capability,
                beepOnLeave?: Capability
            }} ConferenceCapabilities
     */
    var confActions = {
        START: 'start',
        END: 'end',
        JOIN: 'join',
        MULTI_JOIN: 'multJoin',
        SELF_JOIN: 'selfJoin',
        MUTE: 'mute',
        MULTI_MUTE: 'multiMute',
        UNMUTE: 'unmute',
        MULTI_UNMUTE: 'multiUnmute',
        KICK: 'kick',
        MULTI_KICK: 'multiKick'
    };
    var NotifyConferenceTelephonyAPI = /** @class */ (function () {
        /**
         * @param {ConferenceCapabilities=} caps
         */
        function NotifyConferenceTelephonyAPI(caps) {
            this.caps = caps || {};
        }
        /**
         * @param {string} action
         * @returns {boolean}
         */
        NotifyConferenceTelephonyAPI.prototype.isActionSupported = function (action) {
            var actionSupportInfo = this.caps[action] || {};
            var caps = NotifyOnTaskClient.getCapabilityTypes();
            return caps.FULLY_SUPPORTED == actionSupportInfo.isSupported;
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceTelephonyAPI.prototype.start = function (data) {
            return this.doAction(confActions.START, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceTelephonyAPI.prototype.addParticipants = function (data) {
            return this.doAction(confActions.JOIN, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceTelephonyAPI.prototype.selfJoin = function (data) {
            return this.doAction(confActions.SELF_JOIN, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceTelephonyAPI.prototype.end = function (data) {
            return this.doAction(confActions.END, data);
        };
        /**
         *
         * @param {ConferenceInputData} data
         */
        NotifyConferenceTelephonyAPI.prototype.validateInputData = function (data) {
            if (!data)
                throw new Error('Invalid data found');
            if (!Array.isArray(data.items))
                throw new Error('Invalid participants found');
            if (data.items.length == 0)
                throw new Error('Found zero participants');
        };
        /**
         *
         * @param {ConferenceInputData} data
         */
        NotifyConferenceTelephonyAPI.prototype.validateConfId = function (data) {
            if (!(data && typeof data.confId == 'string' && data.confId.length > 0))
                throw new Error("Invalid conference Id passed");
        };
        /**
         * @param {string} action
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceTelephonyAPI.prototype.doAction = function (action, data) {
            var actionPromise = jQuery.Deferred();
            try {
                if (action == confActions.END ||
                    action == confActions.MULTI_MUTE ||
                    action == confActions.MULTI_UNMUTE ||
                    action == confActions.SELF_JOIN ||
					action == confActions.MULTI_JOIN ||
					action == confActions.KICK ||
					action == confActions.MULTI_KICK)
                    this.validateConfId(data);
                else if (action == confActions.START || action == confActions.SELF_JOIN) {
                    if (action == confActions.START)
                        this.validateInputData(data);
                    else
                        this.validateConfId(data);
                }
                else
                    this.validateInputData(data);
            }
            catch (e) {
                return actionPromise.reject(e);
            }
            var self = this;
            data.serviceProvider = this.getName();
            NotifyOnTaskClient.fetchServiceProviderDetails().then(function (result) {
                self.caps = self.caps || result.caps[self.getName()];
                if (!self.isActionSupported(action))
                    return actionPromise.reject('Action is not supported');
                var url = '/api/now/notify/conference/telephony/' + action;
                var headers = {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                };
                if (typeof g_ck === 'string' && g_ck.length > 0)
                    headers['X-UserToken'] = g_ck;
                jQuery.ajax({
                    url: url,
                    type: 'POST',
                    data: JSON.stringify(data),
                    headers: headers,
                    success: function (response) {
                        actionPromise.resolve(response.result);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
						var err = jqXHR.responseText;
						if (jqXHR.responseJSON && jqXHR.responseJSON.error)
							err = jqXHR.responseJSON.error.message;
                        actionPromise.reject({status: false, errorMessages:[err]});
                    }
                });
            }, function (reason) {
                actionPromise.reject(reason);
            });
            return actionPromise;
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceTelephonyAPI.prototype.kick = function (data) {
            return this.doAction(confActions.KICK, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceTelephonyAPI.prototype.mute = function (data) {
            return this.doAction(confActions.MUTE, data);
        };
        NotifyConferenceTelephonyAPI.prototype.muteAll = function (data) {
            return this.doAction(confActions.MUTE_ALL, data);
        };
        NotifyConferenceTelephonyAPI.prototype.unmuteAll = function (data) {
            return this.doAction(confActions.UNMUTE_ALL, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceTelephonyAPI.prototype.unmute = function (data) {
            return this.doAction(confActions.UNMUTE, data);
        };
        /**
         * @returns {string | Error}
         */
        NotifyConferenceTelephonyAPI.prototype.getName = function () {
            return "Telephony";
        };
        return NotifyConferenceTelephonyAPI;
    }());
    return NotifyConferenceTelephonyAPI;
})());
