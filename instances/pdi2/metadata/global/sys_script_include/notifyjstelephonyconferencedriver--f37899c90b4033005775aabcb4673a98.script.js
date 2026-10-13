var NotifyJSTelephonyConferenceDriver = Class.create();
NotifyJSTelephonyConferenceDriver.prototype = {
	/**
	 * @type {global.NotifyConferenceAPI}
	 */
	conferenceObj: null,
	/**
	 * @returns {boolean} - return 'true' only it is fully configured and ready to use
	 */
	isAvailable: function () {
		if(typeof this._ready === 'undefined')
			this._ready = (new NotifyUtil()).hasVoiceCapableNumber();
		return this._ready;
	},
	getConferenceTableName: function () {
		return 'notify_conference_call';
	},
	getParticipantTableName: function () {
		return 'notify_participant';
	},
	getEventHandlerAPI: function () {
		return global.ConferenceEventHandler;
	},
	createEventHandlerInstance: function () {
		return new global.ConferenceEventHandler();
	},
	getConferenceAPI: function () {
		return global.NotifyJSTelephonyConferenceAPI;
	},
	createConferenceInstance: function () {
		return new global.NotifyJSTelephonyConferenceAPI(this);
	},
	getParticipantAPI: function () {
		return NotifyConferenceParticipant;
	},
	createParticipantInstance: function () {
		return new global.NotifyConferenceParticipant();
	},
	throwImplementationError: function () {
		throw new Error(gs.getMessage("Severe problem with telephonic driver"));
	},
	/**
	 * @returns {string} - returns driver name. must be implemented by subclass
	 */
	getName: function () {
		return 'Telephony';
	},
	/**
	 * @param {global.NotifyConferenceAPI=} conferenceObj
	 */
	initialize: function (conferenceObj) {
		this.conferenceObj = null;
		if (conferenceObj)
			this.setConferenceObject(conferenceObj);
	},
	/**
	 * @param {global.NotifyConferenceAPI} confObj
	 */
	setConferenceObject: function (confObj) {
		this.validateConferenceObject(confObj);
		this.conferenceObj = confObj;
	},
	/**
	 * @param {global.NotifyConferenceAPI} conferenceObj
	 * @param {Array<global.NotifyConferenceParticipant>} participants
	 * @param {GlideRecord=} sourceGR
	 */
	startConference: function (conferenceObj, participants, sourceGR) {
		this.setConferenceObject(conferenceObj);
		var self = this;
		var allErrors = [];
		participants.forEach(function (participant) {
			participant.setSourceGR(sourceGR);
			try {
				self.addParticipant(participant);
			} catch (e) {
				if (e instanceof global.NotifyInterfaceException) {
					allErrors.push(e.message);
				} else
					throw e;
			}
		});
		if (allErrors.length > 0) {
			if (allErrors.length < participants.length) {
				allErrors.unshift(gs.getMessage("Call to some participants failed. So conference might still get started with incomplete list of participants."));
			}
			throw new global.NotifyInterfaceException(allErrors);
		}
	},
	validateConferenceObject: function (conf) {
		if (!this.isValidConferenceObject(conf))
			throw new Error(gs.getMessage('Must be a subclass of "global.NotifyConferenceAPI"'));
	},
	isValidConferenceObject: function (confObj) {
		return typeof confObj != 'undefined';
	},
	/**
	 *
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	addParticipant: function (participant) {
		var sourceGR = participant.getSourceGR();
		if (!sourceGR)
			sourceGR = null;
		var notifyApi = new SNC.Notify();
		notifyApi.call(participant.fromNumber, participant.phoneNumber, this.conferenceObj.getConferenceGR(), participant.id, participant.getGroupId(), sourceGR);
		if (notifyApi.hasErrors()) {
			throw new global.NotifyInterfaceException(gs.getMessage("Could not call participant with number {0} due to error(s): {1}", [participant.phoneNumber, j2js(notifyApi.getErrors()).join(' * ')]));
		}
		return true;
	},
	/**
	 *
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	mute: function (participant) {
		SNC.Notify.mute(participant.getParticipantGR());
		return true;
	},
	/**
	*
	* @param {Array<global.NotifyConferenceParticipant>} participants
	*/
	multiMute: function (participants) {
	},
	/**
	 *
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	unmute: function (participant) {
		SNC.Notify.unmute(participant.getParticipantGR());
		return true;
	},
	/**
	*
	* @param {Array<global.NotifyConferenceParticipant>} participants
	*/
	multiUnmute: function (participants) {
	},
	/**
	 *
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	removeParticipant: function (participant) {
		SNC.Notify.kick(participant.getParticipantGR());
		return true;
	},
	/**
	 *
	 * @param {global.NotifyConferenceParticipant} participants
	 */
	removeParticipants: function (participants) {
	},
	/**
	 * @param {NotifyConferenceCallGR} confGR
	 */
	endConference: function () {
		var confGR = this.conferenceObj.getConferenceGR();
		var participantGR = new GlideRecord('notify_participant');
		participantGR.addActiveQuery();
		participantGR.addQuery('notify_conference_call', confGR.getUniqueValue());
		participantGR.query();
		while (participantGR.next())
			SNC.Notify.kick(participantGR);
		var db = new global.NotifyDatabase();
		db.setConferenceCallActiveState(confGR, false);
		return true;
	},
	getCapabilities: function () {
		var capsType = ConferenceFactory.getCapabilityTypes();
		var obj = ConferenceFactory.getCapabilitiesTemplate();
		for (var prop in obj)
			obj[prop].isSupported = capsType.NOT_SUPPORTED;
		obj.start.isSupported = capsType.FULLY_SUPPORTED;
		obj.selfJoin.isSupported = capsType.FULLY_SUPPORTED;
		obj.end.isSupported = capsType.FULLY_SUPPORTED;
		obj.join.isSupported = capsType.FULLY_SUPPORTED;
		obj.multiJoin.isSupported = capsType.FULLY_SUPPORTED;
		obj.mute.isSupported = capsType.FULLY_SUPPORTED;
		obj.multiMute.isSupported = capsType.FULLY_SUPPORTED;
		obj.unmute.isSupported = capsType.FULLY_SUPPORTED;
		obj.multiUnmute.isSupported = capsType.FULLY_SUPPORTED;
		obj.kick.isSupported = capsType.FULLY_SUPPORTED;
		obj.multiKick.isSupported = capsType.FULLY_SUPPORTED;
		obj.title.isSupported = capsType.FULLY_SUPPORTED;
		obj.asyncStart.isSupported = capsType.FULLY_SUPPORTED;
		obj.asyncMultiJoin.isSupported = capsType.FULLY_SUPPORTED;
		return obj;
	},
	/**
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	makeHost: function (participant) {
		throw new Error('Not supported');
	},

	getEventForActionMap: function(){
		var result = {
			onSuccess: {},
		};
		return result;
	},

	/*
		Return the validations that are used in Notify UIB - email | phoneNumber
	*/
	getAllowedIdentifierTypes: function(){
		return ["phoneNumber"];
	},

	type: 'NotifyJSTelephonyConferenceDriver'
};
