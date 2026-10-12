/**
 * RegistrationKeyManager Script Include (instance-side)
 *
 * Classic Script Include prototype style that runs on the instance using Glide APIs.
 *
 * Responsibilities:
 * - Create registration keys with HMAC and Base64 encoding.
 * - Retrieve the most recent active key (optionally creating one if needed).
 * - Revoke or reinstate existing keys.
 * - Validate a key's signature and its active status in the database.
 *
 * Dependencies (ServiceNow globals):
 * - gs, GlideRecord, GlideDateTime, GlideStringUtil, sn_kmf_ns.KMFCryptoOperation
 *
 * Data model: sn_mid_infra_registration_key
 * - key (password2): stored encrypted; supposed to be read via getDecryptedValue('key')
 *                    but due to some kmf limitations we are manually encrypting and decrypting it
 * - valid_until (glide_date_time)
 * - revoked (boolean)
 */
/**
 * @class RegistrationKeyManager
 * @classdesc Server-side manager for the lifecycle of MID Infrastructure registration keys.
 * @constructor
 */
var RegistrationKeyManager = Class.create()
/** @lends RegistrationKeyManager# */
RegistrationKeyManager.prototype = {
    initialize: function () {
        // Validity configuration (now in minutes)
        /**
         * Default validity window in minutes.
         * @type {number}
         */
        this._DEFAULT_VALIDITY_MINUTES = 60 // default 60 minutes
        /**
         * Minimum validity window in minutes.
         * @type {number}
         */
        this._MIN_VALIDITY_MINUTES = 1 // minimum 1 minute
        /**
         * Maximum validity window in minutes (60 days).
         * @type {number}
         */
        this._MAX_VALIDITY_MINUTES = 60 * 24 * 60
        /**
         * Target table storing registration keys.
         * @type {string}
         */
        this._TABLE_NAME = 'sn_mid_registration_key'
        /**
         * Seconds in one minute (time arithmetic helper).
         * @type {number}
         */
        this._SECONDS_IN_MINUTE = 60
        // Crypto configuration
        /**
         * KMF crypto module name used for MAC generation/verification.
         * @type {string}
         */
        this._KMF_MODULE_NAME = 'sn_mid_infra.mid_infra_crypto_module'
        /**
         * KMF IO format for input/output (Base64).
         * @type {string}
         */
        this._KMF_IO_FORMAT = 'KMFBASE64'
        this._WRAPPING_ALGORITHM = 'AES'
        this._WRAPPING_MODE = 'SYMMETRIC_WRAPPING'
        this._UNWRAPPING_MODE = 'SYMMETRIC_UNWRAPPING'
        this.validationUtil = undefined;
        this.userUtility = undefined;
    },

    // Overload emulation: if no argument, uses default validity
    /**
     * Creates a new registration key with the specified validity period.
     * - When no argument is provided, uses the default validity window (60 minutes).
     * - Validity bounds are enforced: min 1 minute, max 60 days.
     * - On success, inserts a row into `sn_mid_registration_key` and returns details.
     *
     * @method
     * @name RegistrationKeyManager#createKey
     * @param {string} assignedToUserSysId - Mandatory sys_id of the user to assign the key to.
     * @param {number} [validityInMinutes] - Optional validity window in minutes. Defaults to 60 minutes if not provided.
     * @returns {{ sysId: string, key: string, validUntil: string, revoked: boolean }} Returns the newly created key record details. The `key` field is the Base64-encoded registration key (not decrypted/plaintext).
     * @throws {Error} if assignedToUserSysId is invalid or validity is out of range or insert fails.
     */
    createKey: function (assignedToUserSysId, validityInMinutes) {
        // Validate assignedToUserSysId is provided and valid
        if (typeof assignedToUserSysId === 'undefined' || assignedToUserSysId === null) {
            throw new InvalidValueError('assignedToUserSysId is required and cannot be null or undefined.');
        }

        if (assignedToUserSysId === '') {
            throw new InvalidValueError('assignedToUserSysId cannot be an empty string.');
        }

        if (!this._getUserUtility().isValidMidUser(assignedToUserSysId)) {
            throw new InvalidValueError('The provided assigned_to value does not correspond to a valid, active MID user. Ensure the sys_id belongs to an existing user with the required MID server roles.');
        }

        if (typeof validityInMinutes === 'undefined') {
            validityInMinutes = this._DEFAULT_VALIDITY_MINUTES;
        }

        // Disallow fractional minutes
        if (typeof validityInMinutes !== 'number' || isNaN(validityInMinutes) || !Number.isInteger(validityInMinutes)) {
            throw new InvalidValueError('Validity period must be an integer number of minutes.')
        }

        var minValidityMinutes = this._MIN_VALIDITY_MINUTES
        var maxValidityMinutes = this._MAX_VALIDITY_MINUTES

        if (validityInMinutes < minValidityMinutes || validityInMinutes > maxValidityMinutes) {
            throw new InvalidValueError('Validity period of ' + validityInMinutes + ' minutes is outside the allowed range.')
        }

        // Validate assignedToUserSysId format
        if (!this._getValidationUtil().validateSysId(assignedToUserSysId, 'assignedToUserSysId', false)) {
            throw new InvalidValueError('Invalid user sys_id provided for assigned_to.');
        }

        var rawKey = this._generateEncodedKey()

        var gr = new GlideRecord(this._TABLE_NAME)
        gr.initialize()

        var validUntil = new GlideDateTime()
        validUntil.addSeconds(validityInMinutes * this._SECONDS_IN_MINUTE)

        // gr.key.setDisplayValue(newKey). //kmf pwd2 operations directly not honuring the MAP for this script include as of now

        var cryptoOp = new sn_kmf_ns.KMFCryptoOperation(this._KMF_MODULE_NAME, this._WRAPPING_MODE).withAlgorithm(this._WRAPPING_ALGORITHM);
		var encryptedKey = cryptoOp.doOperation(String(rawKey));
        gr.setValue('key', String(encryptedKey))

        gr.setValue('valid_until', validUntil.getValue())
        gr.setValue('revoked', false)
        gr.setValue('assigned_to', assignedToUserSysId)

        var sysId = gr.insert()

        if (!sysId) {
            throw new InvalidStateError('Failed to insert a new registration key.')
        }

        return {
            sysId: sysId,
            key: rawKey,
            validUntil: validUntil.getValue(),
            revoked: false,
        }
    },


    /**
     * Revokes a key by sys_id.
     * @method
     * @name RegistrationKeyManager#revokeKey
     * @param {string} keySysId The sys_id of the key to revoke.
     * @returns {boolean} true if updated, false otherwise
     */
    revokeKey: function (keySysId) {
        var gr = new GlideRecord(this._TABLE_NAME)
        gr.addQuery('sys_id', keySysId)
        gr.query();
        if (gr.next()) {
            gr.setValue('revoked', true)
            gr.setValue('revocation_reason', 'manual')
            gr.update()
            return true
        }
        gs.warn('Could not find key with sys_id: ' + keySysId + ' to revoke.')
        return false
    },


    /**
     * Verifies a registration key by validating its signature and checking active state in database.
     * - Returns true only if the signature is valid AND the key is present and active in the table.
     * - Note: consumed_at and use_count threshold checks are now handled by auto-revocation.
     * @method
     * @name RegistrationKeyManager#verifyRegistrationKey
     * @param {string} registrationKey The Base64-encoded registration key string.
     * @returns {boolean}
     */
    verifyRegistrationKey: function (registrationKey) {
        if (!this._getValidationUtil().validateNonEmptyString(registrationKey, 'registrationKey', false)) {
            gs.warn('Invalid registrationKey provided to verifyRegistrationKey. Expected a non-empty string.');
            return false;
        }

        if (!this.isSignatureValid(registrationKey.trim())) {
            gs.warn('Registration key failed signature validation.')
            return false;
        }

        var keyDetails = this.getKeyRecordDetails(registrationKey);
        if (!keyDetails) {
            gs.warn('Registration key not found in database or is revoked/expired.');
            return false;
        }
        
        // Check if assigned_to user is null or deleted
        if (gs.nil(keyDetails.assignedTo)) {
            gs.warn('Registration key has no assigned user.');
            return false;
        }
        
        // Verify assigned_to user still exists and is active
        var userGr = new GlideRecord('sys_user');
        if (!userGr.get(keyDetails.assignedTo)) {
            gs.warn('Registration key assigned user not found or deleted: ' + keyDetails.assignedTo);
            return false;
        }
        var activeValue = userGr.getValue('active');
        if (activeValue != 'true' && activeValue != '1' && activeValue !== true) {
            gs.warn('Registration key assigned user is inactive: ' + keyDetails.assignedTo);
            return false;
        }
        
        // consumed_at and use_count threshold checks removed - now handled by auto-revocation
        // Keys are automatically revoked when consumed or when use_count reaches threshold
        // The revoked field check in getKeyRecordDetails() covers these cases
        
        return true;
    },

    /**
     * Retrieves full registration key record details including new tracking fields.
     * @method
     * @name RegistrationKeyManager#getKeyRecordDetails
     * @param {string} registrationKey - The Base64-encoded registration key
     * @param {string} [assignedTo] - Optional. The expected assigned_to user sys_id to filter by
     * @returns {Object|null} Object with {sysId, assignedTo, useCount, consumedAt, revoked, validUntil} or null
     */
    getKeyRecordDetails: function(registrationKey, assignedTo) {
        if (!this.isSignatureValid(registrationKey.trim())) {
            return null;
        }
        
        var gr = new GlideRecord(this._TABLE_NAME);
        gr.addQuery('revoked', false);

        // Optionally filter by assigned_to if provided
        if (assignedTo) {
            gr.addQuery('assigned_to', assignedTo);
        }

        var now = new GlideDateTime();
        gr.addQuery('valid_until', '>=', now.getValue());
        gr.orderByDesc('sys_created_on');
        gr.query();
        
        while (gr.next()) {
            var cryptoOp = new sn_kmf_ns.KMFCryptoOperation(this._KMF_MODULE_NAME, this._UNWRAPPING_MODE)
                .withAlgorithm(this._WRAPPING_ALGORITHM);
            var key = cryptoOp.doOperation(String(gr.key));
            if (key.trim() === registrationKey.trim()) {
                return {
                    sysId: gr.getUniqueValue(),
                    assignedTo: gr.getValue('assigned_to'),
                    useCount: parseInt(gr.getValue('use_count') || 0),
                    consumedAt: gr.getValue('consumed_at'),
                    revoked: gr.getValue('revoked') == 'true',
                    validUntil: gr.getValue('valid_until')
                };
            }
        }
        return null;
    },

    /**
     * Increments the use count for a registration key.
     * Auto-revokes the key if use_count reaches the threshold.
     * @method
     * @name RegistrationKeyManager#incrementUseCount
     * @param {string} registrationKeySysId - The sys_id of the registration key record
     * @returns {boolean} True if incremented successfully
     */
    incrementUseCount: function(registrationKeySysId) {
        if (!this._getValidationUtil().validateSysId(registrationKeySysId, 'registrationKeySysId', false)) {
            return false;
        }
        
        var gr = new GlideRecord(this._TABLE_NAME);
        if (gr.get(registrationKeySysId)) {
            var newCount = parseInt(gr.getValue('use_count') || 0) + 1;
            gr.setValue('use_count', newCount);
            
            // Auto-revoke if threshold reached
            var maxUseCount = this._getMaxUseCount();
            if (newCount >= maxUseCount) {
                gr.setValue('revoked', true);
                gr.setValue('revocation_reason', 'threshold_exceeded');
                gs.info('Registration key auto-revoked: use_count (' + newCount + 
                        ') reached threshold (' + maxUseCount + '). Key sys_id: ' + registrationKeySysId);
            }
            
            gr.update();
            return true;
        }
        return false;
    },

    /**
     * Marks a registration key as consumed by setting consumed_at timestamp.
     * Auto-revokes the key when consumed.
     * @method
     * @name RegistrationKeyManager#markConsumed
     * @param {string} registrationKeySysId - The sys_id of the registration key record
     * @returns {boolean} True if marked successfully
     */
    markConsumed: function(registrationKeySysId) {
        if (!this._getValidationUtil().validateSysId(registrationKeySysId, 'registrationKeySysId', false)) {
            return false;
        }
        
        var gr = new GlideRecord(this._TABLE_NAME);
        if (gr.get(registrationKeySysId)) {
            if (gs.nil(gr.getValue('consumed_at'))) {
                var now = new GlideDateTime();
                gr.setValue('consumed_at', now.getValue());
                gr.setValue('revoked', true);
                gr.setValue('revocation_reason', 'consumed');
                gs.info('Registration key auto-revoked: marked as consumed. Key sys_id: ' + registrationKeySysId);
                gr.update();
                return true;
            }
        }
        return false;
    },

    /**
     * Validates only the signature of a registration key string.
     * - Returns false for empty input, invalid Base64, or missing delimiter.
     * @method
     * @name RegistrationKeyManager#isSignatureValid
     * @param {string} registrationKey The Base64-encoded registration key string.
     * @returns {boolean}
     */
    isSignatureValid: function (registrationKey) {
        if (!registrationKey) {
            gs.warn('isSignatureValid called with an empty key.')
            return false
        }

        try {
            var decodedKey = gs.base64Decode(registrationKey)
            var lastColonIndex = decodedKey.lastIndexOf(':')
            if (lastColonIndex === -1) {
                return false
            }
            var originalData = decodedKey.substring(0, lastColonIndex)
            var hmac = decodedKey.substring(lastColonIndex + 1)
            return this._validateHmac(originalData, hmac)
        } catch (e) {
            gs.warn('Error during key validation, possibly invalid format. Error: ' + e.message + ' Stack: ' + e.stack)
            return false
        }
    },

    // Keep first and last 4 characters; mask the middle with asterisks.
    // Handles undefined/null and short keys safely.
    /**
     * Gets the maximum use count threshold from system property.
     * @private
     * @returns {number} Maximum use count (default: 5)
     */
    _getMaxUseCount: function() {
        var maxCount = gs.getProperty('sn_mid_infra.registration_key.max_use_count', '5');
        return parseInt(maxCount) || 5;
    },

    maskRegistrationKey: function (key) {
        if (typeof key !== 'string' || key.trim().length === 0) return ''
        var len = key.trim().length
        var keepStart = Math.min(4, len)
        // Ensure start and end segments do not overlap for short keys
        var keepEnd = Math.min(4, Math.max(len - keepStart, 0))
        var first = key.trim().substring(0, keepStart)
        var last = keepEnd > 0 ? key.trim().substring(len - keepEnd) : ''
        var middleLen = Math.max(len - (keepStart + keepEnd), 0)
        var stars = middleLen > 0 ? new Array(Math.min(middleLen, 4) + 1).join('*') : ''
        return first + stars + last
    },

    /**
     * Generates a new key with HMAC and encodes it in Base64.
     * @private
     * @returns {string}
     */
    _generateEncodedKey: function () {
        var randomGUID = gs.generateGUID()
        if (typeof randomGUID !== 'string' || randomGUID.length === 0) {
            throw new InvalidStateError('Failed to generate GUID for registration key.')
        }
        var instanceSysId = gs.getProperty('instance_id')
        if (typeof instanceSysId !== 'string' || instanceSysId.length === 0) {
            throw new InvalidStateError('Could not find a valid Instance ID.')
        }

        var certGr = new GlideRecord('sys_kmf_certificate')
        certGr.addQuery('subject_given_name', 'InstancePKI-Issuing-CA')
        certGr.orderByDesc('sys_created_on')
        certGr.setLimit(1)
        certGr.query()

        if (!certGr.next()) {
            throw new InvalidStateError('Could not find a valid Issuing CA certificate (InstancePKI-Issuing-CA).')
        }
        var subjectOrganization = certGr.getValue('subject_organization')
        if (typeof subjectOrganization !== 'string' || subjectOrganization.length === 0) {
            throw new InvalidStateError('subject_organization is empty for Issuing CA certificate (InstancePKI-Issuing-CA) with id: ' + certGr.getValue('sys_id'));
        }

        var dataToSign = randomGUID + ':' + instanceSysId + ':' + subjectOrganization
        var hmac = this._generateHmac(dataToSign)

        var finalKey = dataToSign + ':' + hmac
        return gs.base64Encode(finalKey)
    },

    /**
     * Generates an HMAC for the given data string (Base64 in/out via KMF operation).
     * @private
     * @param {string} dataToSign
     * @returns {string}
     * @throws {Error} if input is not a string or is empty
     */
    _generateHmac: function (dataToSign) {
        if (typeof dataToSign !== 'string' || dataToSign.length === 0) {
            throw new InvalidValueError('_generateHmac requires a non-empty string.')
        }
        var encryptOp = new sn_kmf_ns.KMFCryptoOperation(this._KMF_MODULE_NAME, 'MAC_GENERATION')
            .withInputFormat(this._KMF_IO_FORMAT)
            .withOutputFormat(this._KMF_IO_FORMAT)
        var hmacValue = encryptOp.doOperation(gs.base64Encode(dataToSign))
        return hmacValue
    },

    /**
     * Validates an HMAC for a given original data string using KMF.
     * @private
     * @param {string} originalData
     * @param {string} hmac
     * @returns {boolean}
     * @throws {Error} if inputs are not strings or are empty
     */
    _validateHmac: function (originalData, hmac) {
        if (
            typeof originalData !== 'string' ||
            originalData.length === 0 ||
            typeof hmac !== 'string' ||
            hmac.length === 0
        ) {
            throw new InvalidValueError('_validateHmac requires non-empty string inputs.')
        }
        try {
            var validateOp = new sn_kmf_ns.KMFCryptoOperation(this._KMF_MODULE_NAME, 'MAC_VERIFICATION')
                .withInputFormat(this._KMF_IO_FORMAT)
                .withOutputFormat(this._KMF_IO_FORMAT)
                .withAdditionalInput(hmac)
            return validateOp.doOperation(gs.base64Encode(originalData), hmac)
        } catch (e) {
            gs.error('Error during HMAC validation: ' + e.message + ' Stack: ' + e.stack)
            return false
        }
    },

    /**
     * Exposes validity configuration for external consumers (minutes only).
     * @method
     * @name RegistrationKeyManager#getValidityConfig
     * @returns {{
     *   defaultMinutes: number,
     *   minMinutes: number,
     *   maxMinutes: number
     * }}
     */
    getValidityConfig: function () {
        return {
            defaultMinutes: this._DEFAULT_VALIDITY_MINUTES,
            minMinutes: this._MIN_VALIDITY_MINUTES,
            maxMinutes: this._MAX_VALIDITY_MINUTES,
        }
    },

    _getValidationUtil: function() {
        if (this.validationUtil === undefined) {
            this.validationUtil = new ValidationUtility();
        }
        return this.validationUtil;
    },

    _getUserUtility: function() {
        if (this.userUtility === undefined) {
            this.userUtility = new UserUtility();
        }
        return this.userUtility;
    },

    type: 'RegistrationKeyManager',
}
