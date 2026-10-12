/**
 * KMFCertificateUtility class for managing sys_kmf_certificate records.
 */
var KMFCertificateUtility = Class.create();
KMFCertificateUtility.prototype = {
    TABLE_NAME: 'sys_kmf_certificate',
    FIELD_SUBJECT_GIVEN_NAME: 'subject_given_name',
    FIELD_SUBJECT_PUBLIC_KEY: 'subject_public_key',
    FIELD_SYS_CREATED_ON: 'sys_created_on',
    FIELD_SYS_ID: 'sys_id',
    FIELD_REVOCATION_DATE: 'revocation_date',
    
    OID_MAP: {
        UID: '0.9.2342.19200300.100.1.1',
        CUSTOMER_ID: '2.5.4.10',
        INSTANCE_HOSTNAME: '2.5.4.3',
        INSTANCE_ID: '2.5.4.4',
        SERVICE_TYPE: '2.5.4.42',
        SNC_PKI_EXT_MID_SERVICES: '1.3.6.1.4.1.56079.2.2.21.7'
    },

    initialize: function() {
        this.validationUtil = undefined;
        this.dbQueryUtil = undefined;
        this.sessionToken = undefined;
    },

    /**
     * Get the latest KMF certificate GlideRecord for a given subject_given_name.
     *
     * @param {string} subjectGivenName - Mandatory. The certificate's subject_given_name to look up.
     * @returns {GlideRecord|null} The matching sys_kmf_certificate record if found; otherwise null.
     * @throws {InvalidValueError} When subjectGivenName is not a non-empty string.
     */
    getLatestBySubjectName: function (subjectGivenName) {

        // empty string is not allowed
        this._getValidationUtil().validateNonEmptyString(subjectGivenName, 'subject_given_name', true);

        var certGr = new GlideRecord(this.TABLE_NAME);

        // defensive coding here checking for trimmed contain to handle leading/trailing spaces
        // Sanitize input to prevent wildcard injection
        var sanitizedString = this._getDbQueryUtil().sanitizeForContainsQuery(subjectGivenName.trim());
        certGr.addQuery(this.FIELD_SUBJECT_GIVEN_NAME, 'CONTAINS', sanitizedString);
        certGr.addNullQuery(this.FIELD_REVOCATION_DATE);
        certGr.orderByDesc(this.FIELD_SYS_CREATED_ON);
        certGr.orderByDesc(this.FIELD_SYS_ID);
        certGr.setLimit(1);
        certGr.query();
        if (certGr.next()) 
            return certGr;
        
        gs.debug('Certificate lookup: No certificate found for subject_given_name: ' + subjectGivenName + '. Session Token: ' + this._getSessionToken());
        return null;
    },

    /**
     * Gets a KMF certificate GlideRecord by its full PEM certificate content.
     *
     * @param {string} pemCertificate - The full PEM-encoded certificate string.
     * @returns {GlideRecord|null} The matching sys_kmf_certificate record if found; otherwise null.
     * @throws {InvalidValueError} When pemCertificate is not a non-empty string.
     */
    getByPemCertificate: function(pemCertificate) {
        this._getValidationUtil().validateNonEmptyString(pemCertificate, 'pemCertificate', true);

        var certGr = new GlideRecord(this.TABLE_NAME);
        certGr.addQuery('pem_certificate', pemCertificate);
        certGr.setLimit(1);
        certGr.query();

        if (certGr.next()) {
            return certGr;
        }

        gs.debug('Certificate lookup: No certificate found matching the provided PEM certificate. Session Token: ' + this._getSessionToken());
        return null;
    },

    /**
     * Find a KMF certificate GlideRecord by its public key.
     *
     * @param {string} publicKey - The certificate's subject_public_key to look up.
     *                             If null or undefined, treated as empty string and returns null.
     * @returns {GlideRecord|null} The matching sys_kmf_certificate record if found; otherwise null.
     * @throws {InvalidValueError} When publicKey is provided but is not a string
     */
    getByPublicKey: function (publicKey) {
        // Handle null/undefined as empty string
        if (publicKey == null) {
            return null;
        }
        
        // Must be a non-empty string at this point
        this._getValidationUtil().validateString(publicKey, 'publicKey', true);

        var certGr = new GlideRecord(this.TABLE_NAME);
        certGr.addQuery(this.FIELD_SUBJECT_PUBLIC_KEY, publicKey);
        certGr.orderByDesc(this.FIELD_SYS_CREATED_ON);
        certGr.setLimit(1);
        certGr.query();
        if (certGr.next()) 
            return certGr;
        
        gs.debug('Certificate lookup: No certificate found for the provided public key. Session Token: ' + this._getSessionToken());
        return null;
    },

    /**
     * Gets a KMF certificate GlideRecord by its sys_id.
     *
     * @param {string} certificateSysId - The sys_id of the certificate to retrieve.
     * @returns {GlideRecord|null} The matching sys_kmf_certificate record if found; otherwise null.
     * @throws {InvalidValueError} When certificateSysId is not a non-empty string.
     */
    getBySysId: function(certificateSysId) {
        this._getValidationUtil().validateNonEmptyString(certificateSysId, 'certificateSysId', true);

        var certGr = new GlideRecord(this.TABLE_NAME);
        certGr.addQuery('sys_id', certificateSysId)
        certGr.query();
        if (certGr.next())
            return certGr;

        return null;
    },

    /**
     * Checks if a KMF certificate is revoked.
     *
     * @param {string|GlideRecord} certificate - The sys_id of the certificate or a GlideRecord object.
     * @returns {boolean} True if the certificate is revoked (has a revocation_date), false otherwise.
     * @throws {InvalidValueError} When certificate is not a valid string or GlideRecord.
     * @throws {ResourceNotFoundError} When certificate sys_id is provided but not found.
     */
    isRevoked: function(certificate) {
        var certGr = this._getRecordFromInput(certificate);
        
        if (!certGr) {
            throw new ResourceNotFoundError('Certificate not found');
        }

        var revocationDate = certGr.getValue('revocation_date');
        return revocationDate !== null && revocationDate !== '';
    },
    /**
     * Checks if a KMF certificate is expired.
     *
     * @param {string|GlideRecord} certificate - The sys_id of the certificate or a GlideRecord object.
     * @returns {boolean} True if the certificate's valid_until date is in the past; false if not expired or no expiry date is set.
     * @throws {InvalidValueError} When certificate is not a valid string or GlideRecord.
     * @throws {ResourceNotFoundError} When certificate sys_id is provided but not found.
     */
    isExpired: function (certificate) {
        var certGr = this._getRecordFromInput(certificate);

        if (!certGr) {
            throw new ResourceNotFoundError('Certificate not found');
        }

        var validUntil = certGr.getValue('valid_until');
        if (!validUntil) {
            return false;
        }

        return new GlideDateTime(validUntil).getNumericValue() <= new GlideDateTime().getNumericValue();
    },

    /**
     * Checks if a KMF certificate is an IPKI MID Services certificate by verifying
     * the presence of the sncPKIExtMIDServices OID (" + this.OID_MAP.SNC_PKI_EXT_MID_SERVICES + ") 
     * in the Extended Key Usage extension.
     *
     * This replaces the legacy ipki_endpoint field check with a cryptographically
     * verifiable certificate attribute check.
     *
     * @param {string|GlideRecord} certificate - The sys_id of the certificate or a GlideRecord object.
     * @returns {boolean} True if the certificate contains the MID Services EKU OID, false otherwise.
     * @throws {InvalidValueError} When certificate is not a valid string or GlideRecord.
     * @throws {ResourceNotFoundError} When certificate sys_id is provided but not found.
     */
    isIpkiMidCertificate: function(certificate) {
        var certGr = this._getRecordFromInput(certificate);
        
        if (!certGr) {
            throw new ResourceNotFoundError('Certificate not found');
        }

        var pemCertificate = certGr.getValue('pem_certificate');
        if (!pemCertificate) {
            gs.debug('Certificate has no PEM content. Session Token: ' + this._getSessionToken());
            return false;
        }

        var certParser = new PemCertificateParser();
        return certParser.hasExtendedKeyUsageOid(pemCertificate, this.OID_MAP.SNC_PKI_EXT_MID_SERVICES);
    },

    /**
     * Gets the OID value from a KMF certificate.
     *
     * @param {string|GlideRecord} certificate - The sys_id of the certificate or a GlideRecord object.
     * @param {string} oid - The OID to retrieve (e.g., '0.9.2342.19200300.100.1.1' for UID).
     * @returns {string|null} The OID value if found; otherwise null.
     * @throws {InvalidValueError} When certificate is not a valid string or GlideRecord, or oid is not in OID_MAP.
     * @throws {ResourceNotFoundError} When certificate sys_id is provided but not found.
     */
    getOidValue: function(certificate, oid) {
        this._getValidationUtil().validateNonEmptyString(oid, 'oid', true);
        
        // Validate OID is in the OID_MAP
        var isValidOid = false;
        for (var key in this.OID_MAP) {
            if (this.OID_MAP.hasOwnProperty(key) && this.OID_MAP[key] === oid) {
                isValidOid = true;
                break;
            }
        }
        
        if (!isValidOid) {
            throw new InvalidValueError('Invalid OID: ' + oid + '. OID not supported for this feature.');
        }
        
        var certGr = this._getRecordFromInput(certificate);
        
        if (!certGr) {
            throw new ResourceNotFoundError('Certificate not found');
        }

        var pemCertificate = certGr.getValue('pem_certificate');
        if (!pemCertificate) {
            return null;
        }

        var certParser = new PemCertificateParser();
        return certParser.getOidValue(pemCertificate, oid);
    },

    /**
     * Private helper to normalize input to a GlideRecord.
     * Accepts either a sys_id string or an existing GlideRecord.
     *
     * @param {string|GlideRecord} certificate - The sys_id of the certificate or a GlideRecord object.
     * @returns {GlideRecord|null} The certificate GlideRecord if found; otherwise null.
     * @throws {InvalidValueError} When certificate is not a valid string or GlideRecord.
     */
    _getRecordFromInput: function(certificate) {
        // If it's already a GlideRecord, validate and return it
        if (certificate && typeof certificate === 'object' && certificate.getTableName && certificate.getTableName() === this.TABLE_NAME) {
            return certificate;
        }
        
        // Otherwise, treat it as a sys_id and fetch the record
        if (typeof certificate === 'string') {
            return this.getBySysId(certificate);
        }
        
        throw new InvalidValueError('Certificate must be either a sys_id string or a GlideRecord object');
    },

    _getDbQueryUtil: function() {
        if (this.dbQueryUtil === undefined) {
            this.dbQueryUtil = new DatabaseQueryUtility();
        }
        return this.dbQueryUtil;
    },

    _getSessionToken: function() {
        if (this.sessionToken === undefined) {
            this.sessionToken = gs.getSession() ? gs.getSession().getSessionToken() : '';
        }
        return this.sessionToken;
    },

    _getValidationUtil: function() {
        if (this.validationUtil === undefined) {
            this.validationUtil = new ValidationUtility();
        }
        return this.validationUtil;
    },

    type: 'KMFCertificateUtility'
};
