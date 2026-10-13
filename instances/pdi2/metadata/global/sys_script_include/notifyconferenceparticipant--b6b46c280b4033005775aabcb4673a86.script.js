var NotifyConferenceParticipant = Class.create();
NotifyConferenceParticipant.prototype = {
	/**@type {string} */
	groupId: null,
	getGroupId: function () {
		return this.groupId;
	},
	setGroupId: function (groupId) {
		this.groupId = groupId;
	},
	/**
	 * @type {string}
	 */
	fromNumber: null,
	getFromNumber: function () {
		return this.fromNumber;
	},
	/**
	 * @param {string} newFromNumber
	 */
	setFromNumber: function (newFromNumber) {
		this.fromNumber = newFromNumber;
	},
	/**
	 * @type {GlideRecord}
	 */
	sourceGR: null,
	getSourceGR: function () {
		return this.sourceGR;
	},
	/**
	 * @param {GlideRecord} newSourceGR
	 */
	setSourceGR: function (newSourceGR) {
		this.sourceGR = newSourceGR;
	},
	/**
	 * @type {string}
	 */
	email: null,
	/**
	 *
	 * @param {string} email
	 */
	setEMailId: function (email) {
		this.email = email
	},
	getEMailId: function () {
		return this.email;
	},

	/**
	 * @type {string} - sys_user id
	 */
	id: null,
	/**
	 * @type {string}
	 */
	phoneNumber: null,
	/**
	 * @type {boolean}
	 */
	muteOnJoin: null,
	/**
	 * @type {global.NotifyConferenceAPI}
	 */
	conferenceObj: null,
	/**
	 * @type {NotifyParticipantGR} - 'notify_participant' or it's subclass
	 */
	gr: null,
	/**
	 *
	 * @param {string=} email sip address
	 * @param {string=} phoneNumber E.164 complaint phone number
	 * @param {string=} id internalId
	 * @param {global.NotifyConferenceAPI=} conf - Conference Object which is holding this participant
	 */
	initialize: function (email, phoneNumber, id, conf) {
		this.sourceGR = null;
		this.fromNumber = '';
		this.groupId = '';
		this.id = '';
		this.phoneNumber = '';
		if (conf)
			this.setConferenceObject(conf);
		if (email)
			this.email = email;
		if (id)
			this.id = id;
		if (phoneNumber)
			this.phoneNumber = phoneNumber;
		this.muteOnJoin = false;
	},
	setMuteOnJoin: function () {
		this.muteOnJoin = true;
	},
	/**
	 * @param {NotifyParticipantGR} gr
	 */
	setParticipantGR: function (gr) {
		if (!gr) {
			this.gr = gr;
			return;
		}
		var confUtils = new NotifyConferenceUtils();
		if (!confUtils.isValidParticipantGR(gr))
			throw new Error('Invalid arguments. Expecting "notify_participant" or subclass');
		this.gr = gr;
	},
	/**
	 * @returns {NotifyParticipantGR | null}
	 */
	getParticipantGR: function () {
		return this.gr;
	},
	/**
	 * @param {global.NotifyConferenceAPI} confObj
	 */
	setConferenceObject: function (confObj) {
		this.validateConferenceObject(confObj)
		this.conferenceObj = confObj;
	},
	validateConferenceObject: function (confObj) {
		if (!this.isValidConferenceObject(confObj))
			throw new Error("Invalid conference object");
	},
	isValidConferenceObject: function (confObj) {
		return typeof this.conferenceObj != 'undefined';
	},
	/**
	 * @param {{[field: string]: any;}} ob
	 */
	populateFieldsFromObject: function (fields) {
		for (var prop in fields)
			this[prop] = fields[prop];
	},
	/**
	 *
	 * @param {string} id
	 */
	setId: function (id) {
		this.id = id;
	},
	getId: function () {
		return this.id;
	},
	name: null,
	setName: function (newName) {
		this.name = newName;
	},
	getName: function () {
		return this.name;
	},
	/**
	 *
	 * @param {string} phoneNumber
	 */
	setPhoneNumber: function (phoneNumber) {
		this.phoneNumber = phoneNumber;
	},
	getPhoneNumber: function () {
		return this.phoneNumber;
	},
	mute: function () {
		this.validateConferenceObject(this.conferenceObj);
		this.conferenceObj.muteParticipant(this);
	},
	unmute: function () {
		this.validateConferenceObject(this.conferenceObj);
		this.conferenceObj.unmuteParticipant(this);
	},
	kick: function () {
		this.validateConferenceObject(this.conferenceObj);
		this.conferenceObj.removeParticipant(this);
	},
	type: 'NotifyConferenceParticipant'
};
