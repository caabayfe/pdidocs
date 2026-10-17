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
        SELF_JOIN: 'selfJoin',
        MUTE: 'mute',
        MULTI_MUTE: 'multiMute',
        UNMUTE: 'unmute',
        MULT_UNMUTE: 'multiUnmute',
        KICK: 'kick',
        MULTI_KICK: 'multiKick'
    };
    var NotifyConferenceClientAPI = /** @class */ (function () {
        /**
         * @param {ConferenceCapabilities=} caps
         */
        function NotifyConferenceClientAPI(caps) {
            this.caps = caps || {};
        }
        /**
         * @param {string} action
         * @returns {boolean}
         */
        NotifyConferenceClientAPI.prototype.isActionSupported = function (action) {
            var actionSupportInfo = this.caps[action] || {};
            var caps = NotifyOnTaskClient.getCapabilityTypes();
            return caps.FULLY_SUPPORTED == actionSupportInfo.isSupported;
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceClientAPI.prototype.start = function (data) {
            return this.doAction(confActions.START, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceClientAPI.prototype.addParticipants = function (data) {
            return this.doAction(confActions.JOIN, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceClientAPI.prototype.selfJoin = function (data) {
            return this.doAction(confActions.SELF_JOIN, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceClientAPI.prototype.end = function (data) {
            return this.doAction(confActions.END, data);
        };
        /**
         * @param {string} action
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceClientAPI.prototype.doAction = function (action, data) {
            var actionPromise = jQuery.Deferred();
            return actionPromise;
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceClientAPI.prototype.kick = function (data) {
            return this.doAction(confActions.KICK, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceClientAPI.prototype.mute = function (data) {
            return this.doAction(confActions.MUTE, data);
        };
        NotifyConferenceClientAPI.prototype.muteAll = function (data) {
            return this.doAction(confActions.MUTE_ALL, data);
        };
        NotifyConferenceClientAPI.prototype.unmuteAll = function (data) {
            return this.doAction(confActions.UNMUTE_ALL, data);
        };
        /**
         * @param {ConferenceInputData} data
         * @returns {Promise<ConferenceActionResult>}
         */
        NotifyConferenceClientAPI.prototype.unmute = function (data) {
            return this.doAction(confActions.UNMUTE, data);
        };
        /**
         * @returns {string | Error}
         */
        NotifyConferenceClientAPI.prototype.getName = function () {
            return "ServiceProviderName";
        };
        return NotifyConferenceClientAPI;
    }());
    return NotifyConferenceClientAPI;
})());
