var NotifyJSConferenceDriver = Class.create();
NotifyJSConferenceDriver.prototype = {
	/**
	 * @type {global.NotifyConferenceAPI}
	 */
	conferenceObj: null,
	/**
	 * @returns {Error | boolean} - return 'true' only it is fully configured and ready to use
	 */
	isAvailable: function () {
		return this.throwImplementationError();
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
		throw new Error(gs.getMessage("Must be implemented by subclass"));
	},
	/**
	 * @returns {string} - returns driver name. must be implemented by subclass
	 */
	getName: function () {
		return 'ServiceProviderName';
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
		return true;
	},
	/**
	 *
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	mute: function (participant) {
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
		return true;
	},
	getCapabilities: function () {
		var capsType = ConferenceFactory.getCapabilityTypes();
		var obj = ConferenceFactory.getCapabilitiesTemplate();
		for (var prop in obj)
			obj[prop].isSupported = capsType.NOT_SUPPORTED;
		return obj;
	},
	/**
	 * @param {global.NotifyConferenceParticipant} participant
	 */
	makeHost: function (participant) {
		throw new Error('Not supported');
	},	// Need to add Telephonic capabilites.
	getEventForActionMap: function(){
		return {};
	},
	getAllowedIdentifierTypes: function(){
		return [];
	},
	type: 'NotifyJSConferenceDriver'
};
