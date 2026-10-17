/**
 * @typedef {Partial<ReturnType<typeof global.ConferenceFactory.getCapabilitiesTemplate>>} global.ConferenceCapabilites
 */

/**
 * @typedef {{ status: boolean, errorMessages: Array<string>,
 		 warnMessages: Array<string>,
		 successMessages: Array<string>,
		 details: {[key: string]: any;}
		}} global.ConferenceActionResult
 */
var NotifyConferenceAPI = Class.create();
NotifyConferenceAPI.prototype = {
	STATE: {
		DRAFT: 'draft',
		STARTING: 'starting',
		IN_PROGRESS: 'in_progress',
		ENDING: 'ending',
		COMPLETE: 'complete'
	},
	/**
	 * @type {global.NotifyConferenceDriver}
	*/
	notifyConfDriver: null,
	confUtils: new global.NotifyConferenceUtils(),
	/**
	 * @type {global.NotifyUtil}
	 */
	notifyUtils: null,
	/**
	 * @type {string}
	 */
	SERVICE_PROVIDER: null,
	/**
	 * notify_conference_call or it's sub class
	 * @type {NotifyConferenceCallGR | null}
	 */
	confGR: null,
	/**
	 * @type {global.ConferenceActionResult}
	 */
	_result: null,
	_addErrorMessage: function (message) {
		this._result.errorMessages.push(message);
	},
	_addWarnMessage: function (message) {
		this._result.warnMessages.push(message);
	},

	_addSuccessMessage: function (message) {
		this._result.successMessages.push(message);
	},
	/**
 	 * @returns {global.ConferenceCapabilites}
 	*/
	getCapabilities: function () {
		this.validateDriver();
		return this.notifyConfDriver.getCapabilities();
	},
	/**
	 *
	 * @param {string | global.NotifyConferenceDriver} serviceProvider
	 * @param {string | NotifyConferenceCallGR=} confIdOrGR
	 */
	initialize: function (serviceProvider, confIdOrGR) {
		this.notifyUtils = new NotifyUtil();
		if (serviceProvider)
			this.setConferenceDriver(serviceProvider);
		this._result = this.confUtils.getConferenceActionResultTemplate();
		if (confIdOrGR)
			this.setActiveConferenceGR(confIdOrGR);
	},
	/**
	 *
	 * @param {string | global.NotifyConferenceDriver} serviceProvider
	 */
	setConferenceDriver: function (serviceProvider) {
		if (typeof serviceProvider === 'string') {
			this.SERVICE_PROVIDER = serviceProvider;
			this.notifyConfDriver = ConferenceFactory.getDriverInstance(serviceProvider);
			return;
		}
		this.SERVICE_PROVIDER = serviceProvider.getName();
		this.notifyConfDriver = serviceProvider;
	},
	/**
	 * @param {global.NotifyConferenceDriver} driverObj
	 */
	isValidDriver: function (driverObj) {
		return typeof driverObj != 'undefined';
	},

	isFunction: function (fn) {
		return typeof fn === 'function';
	},

	/**
	 * @param {global.NotifyConferenceParticipant} participant
	 * @returns {participant is global.NotifyConferenceParticipant}
	 */
	isConferenceParticipant: function (participant) {
		if (typeof participant === 'undefined')
			return false;
		return this.isFunction(participant.setEMailId) && this.isFunction(participant.setPhoneNumber) && this.isFunction(participant.setId);
	},
	validateDriver: function () {
		if (!this.isValidDriver(this.notifyConfDriver))
			throw new Error("Driver object is not set");
		if (!this.notifyConfDriver.isAvailable())
			throw new Error('Please configure driver properly. It is not ready yet');
		this.notifyConfDriver.setConferenceObject(this);
	},
	/**
	 * @param {global.ConferenceInputData} data
	*/
	validateConfData: function (data) {
		if (!data)
			throw new Error("Wrong input data ");
		if (!data.items)
			throw new Error("Input doesn't have valid participant data");
		if (!Array.isArray(data.items))
			throw new Error("Participant data must be an array");

		if (data.items.length == 0)
			throw new Error("Invalid participants received");

		if (typeof data.message == 'string')
			data.message = data.message.trim();
		else
			data.message = undefined;
		if (!data.confId && !data.allowMulticonference && data.sysId) {
			var ccGr = new GlideRecord('notify_conference_call');
			ccGr.addQuery("active", true);
			ccGr.addQuery("source", data.sysId);
			ccGr.setLimit(1);
			ccGr.query();
			if (ccGr.hasNext())
				throw new Error('An active call for this task already exists. You can join the conference call after reloading the form');
		}
	},
	throwImplementationError: function () {
		throw new Error('Must be implemented by subclass');
	},
	/**
	 * @param {global.ConferenceInputData} data
	 * @returns {global.ConferenceActionResult}
	 */
	startConferenceFromData: function (data) {
		return this.throwImplementationError();
	},
	/**
	 * @param {global.ConferenceInputData} data
	 * @returns {global.ConferenceActionResult}
	 */
	addToConferenceFromData: function (data) {
		return this.throwImplementationError();
	},
	/**
	 * @param {GlideRecord=} sourceGR
	 * @param {Array<global.NotifyConferenceParticipant>} participants
	 */
	startConference: function (participants, sourceGR) {
		this.validateDriver();
		if (!this.confUtils.isInDraft(this.confGR))
			throw new Error('Conference must be in draft state');
		var dataFromDriver = this.notifyConfDriver.startConference(this, participants, sourceGR);
		this._result.status = true;
		return this._result.details = dataFromDriver;
	},
	/**
	 * @param {Array<global.NotifyConferenceParticipant>} participants
	 */
	addParticipants: function (participants) {
		this.validateParticipants(participants);
		this.validateDriver();
		if (!this.confUtils.isInProgress(this.confGR))
			throw new Error('Conference is not yet started or completed');
		if(this.notifyConfDriver.isAvailable())
			return this.notifyConfDriver.addParticipants(participants);
		return this._result;
	},
	/**
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	addParticipant: function (participant) {
		return this.addParticipants([participant])
	},
	/**
	 * @param {string} action
	 */
	doConferenceAction: function(action) {
	},
	/**
	 * @param {string} action
	 * @param {Array<global.NotifyConferenceParticipant>} participants
	 */
	doParticipantsAction: function (action, participants) {

	},
	/**
	 *
	 * @param {Array<global.NotifyConferenceParticipant>} participant
	 */
	removeParticipants: function (participants) {
		this.validateParticipants(participants);
		this.validateDriver();
		if (!this.confUtils.isInProgress(this.confGR))
			throw new Error('Conference is not yet started or completed');
		return this.notifyConfDriver.removeParticipants(participants);
	},
	/**
	 *
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	removeParticipant: function (participant) {
		return this.removeParticipants([participant]);
	},
	/**
	 *
	 * @param {Array<global.NotifyConferenceParticipant>} participants
	 */
	muteParticipants: function (participants) {
		this.validateParticipants(participants)
		this.validateDriver();
		if (!this.confUtils.isInProgress(this.confGR))
			throw new Error('Conference is not yet started or completed');
		return this.notifyConfDriver.multiMute(participants);
	},
	/**
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	muteParticipant: function (participant) {
		return this.muteParticipants([participant]);
	},
	/**
	 * @param {Array<global.NotifyConferenceParticipant>} participants
	 */
	unmuteParticipants: function (participants) {
		this.validateParticipants(participants);
		this.validateDriver();
		if (!this.confUtils.isInProgress(this.confGR))
			throw new Error('Conference is not yet started or completed');
		return this.notifyConfDriver.multiUnmute(participants);
	},
	/**
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	unmuteParticipant: function (participant) {
		return this.unmuteParticipants([participant]);
	},
	endConference: function () {
		this.validateDriver();
		this.notifyConfDriver.endConference();
		this._result.status = true;
		return this._result;
	},
	/**
	 * @param {global.NotifyConferenceParticipant | Array<global.NotifyConferenceParticipant>} participants
	 */
	validateParticipants: function (participants) {
		if (Array.isArray(participants)) {
			var self = this;
			participants.forEach(function (par) {
				if (!self.isConferenceParticipant(par))
					throw new Error("Not a valid confernece participant");
			});
		} else {
			if (!this.isConferenceParticipant(participants))
				throw new Error("Not a valid confernece participant");
		}
	},
	/**
	 * @returns {Array<global.NotifyConferenceParticipant>}
	 */
	listAllParticipants: function () {
		this.validateDriver();
		this.validateConferenceGR()
		var participantGR = /**@type {NotifyParticipantGR} */(new GlideRecord(this.getParticipantTableName()));
		participantGR.addQuery(this.notifyConfDriver.getConferenceTableName(), this.confGR.getUniqueValue());
		participantGR.query();
		var participantArray = [];
		while (participantGR.next()) {
			var participant = this.notifyConfDriver.createParticipantInstance();
			participant.setId(participantGR.user + '');
			participant.setPhoneNumber(participantGR.phone_number + '');
			participant.setEMailId(participantGR.email + '');
			participant.setConferenceObject(this);
			participantArray.push(participant);
		}
		return participantArray;
	},
	/**
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	makeHost: function (participant) {
		this.validateDriver();
		return this.notifyConfDriver.makeHost(participant);
	},
	validateConferenceGR: function () {
		if (!this.confUtils.isValidConfGR(this.confGR, this.getConferenceTableName()))
			throw new Error('Not a valid conference call');
	},
	/**
	 * @param {string | NotifyConferenceCallGR} confIdOrGR
	 */
	setActiveConferenceGR: function (confIdOrGR) {
		/**
		 * @type {NotifyConferenceCallGR}
		 */
		var confGR;
		if (typeof confIdOrGR === 'string') {
			confGR = /**@type {NotifyConferenceCallGR} */ (new GlideRecord(this.getConferenceTableName()));
			if (!confGR.get(confIdOrGR))
				throw new Error(confIdOrGR + " not found ");
			this.confGR = confGR;
		} else
			this.confGR = confIdOrGR;
		this.validateConferenceGR();
	},
	getConferenceTableName: function () {
		this.validateDriver();
		return this.notifyConfDriver.getConferenceTableName();
	},
	getParticipantTableName: function () {
		this.validateDriver();
		return this.notifyConfDriver.getParticipantTableName();
	},
	/**
	 * @returns {NotifyConferenceCallGR | null}
	 */
	getConferenceGR: function () {
		return this.confGR;
	},
	getParticipantAPI: function () {
		this.validateDriver();
		return this.notifyConfDriver.getParticipantAPI();
	},
	createParticipantInstance: function () {
		this.validateDriver();
		return this.notifyConfDriver.createParticipantInstance();
	},
	/**
	 * @param {{id?: string, phoneNumber?: string, email?: string}} data
	 * @returns {boolean}
	 */
	hasValidJoinResource: function (data) {
		return false;
	},
	toString: function () {
		return this.type || '1234'; // Needs some scalar value. In some rare cases, expression like "if(ob)"  throwing error.
	},
	type: 'NotifyConferenceAPI'
}
