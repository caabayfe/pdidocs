var CsrValidationEndpoint = Class.create();
CsrValidationEndpoint.prototype = {
    /**
     * Standard revocation reasons that match the KMF IPKI endpoint's RevocationReason enum.
     * Use these values when revoking certificates to ensure validation passes.
     * @type {Object}
     */
    REVOCATION_REASON: {
        UNSPECIFIED: 'UNSPECIFIED',
        KEY_COMPROMISE: 'KEYCOMPROMISE',
        CA_COMPROMISE: 'CACOMPROMISE',
        AFFILIATION_CHANGED: 'AFFILIATIONCHANGED',
        SUPERSEDED: 'SUPERSEDED',
        CESSATION_OF_OPERATION: 'CESSATIONOFOPERATION',
        CERTIFICATE_HOLD: 'CERTIFICATEHOLD',
        UNKNOWN: 'UNKNOWN',
        REMOVE_FROM_CRL: 'REMOVEFROMCRL',
        PRIVILEGE_WITHDRAWN: 'PRIVILEGEWITHDRAWN',
        AA_COMPROMISE: 'AACOMPROMISE'
    },

    initialize: function(endpointName) {
        this.validationUtil = new ValidationUtility();
        this.validationUtil.validateNonEmptyString(endpointName, 'endpointName', true);

        this.endpointName = endpointName;
        this.endpoint = new sn_kmf_ns.KMFInstancePKI().getEndpoint(endpointName);
        if (!this.endpoint) {
            throw new ResourceNotFoundError('CSR Validation endpoint not found: ' + endpointName);
        }
        this.sessionToken = undefined;
    },

    /**
     * Extracts a value from a CSR's subject DN based on type.
     * @param {string} csr - The certificate signing request.
     * @param {string} type - The type of the component to extract (e.g., 'UID', 'CN').
     * @returns {string|null} The component value, or null if not found.
     * @throws {Error} If parsing fails or the data structure is invalid.
     */
    getSubjectDNComponentValue: function(csr, type) {
        this._getValidationUtil().validateNonEmptyString(csr, 'csr', true);
        this._getValidationUtil().validateNonEmptyString(type, 'type', true);

        var csrSubjectDNComponents = this.endpoint.getCSRSubjectDNComponents(csr);
        if (!csrSubjectDNComponents) {
            throw new RuntimeError('Unable to parse CSR subject DN components');
        }

        try {
            var csrSubjectDNComponentData = JSON.parse(csrSubjectDNComponents);
            if (!csrSubjectDNComponentData || !csrSubjectDNComponentData.components || !Array.isArray(csrSubjectDNComponentData.components)) {
                throw new RuntimeError('Invalid CSR subject DN component data structure');
            }

            for (var i = 0; i < csrSubjectDNComponentData.components.length; i++) {
                var component = csrSubjectDNComponentData.components[i];
                if (component.type === type) {
                    return component.value;
                }
            }

            gs.debug('CSR parsing: Component type: ' + type + ' not found in subject DN. Session Token: ' + this._getSessionToken());
            return null; // Component type not found
        } catch (e) {
            throw new RuntimeError('CSR parsing failed', e);
        }
    },

    /**
     * Revokes a single certificate.
     * @param {string} sysId - The sys_id of the certificate to revoke.
     * @param {string} reason - The reason for revocation.
     * @throws {RuntimeError} If the revocation fails.
     */
    revokeCertificate: function(sysId, reason) {
        this._getValidationUtil().validateNonEmptyString(reason, 'reason', true);

        try {
            var responseJson = this.endpoint.revoke(sysId, reason);
            if (!responseJson) {
                throw new RuntimeError('Failed to revoke certificate ' + sysId + '. Response: ' + responseJson);
            }

            var response = JSON.parse(responseJson);
            if (!response || !response.success) {
                throw new RuntimeError('Failed to revoke certificate ' + sysId + '. Response: ' + responseJson);
            }
        } catch (e) {
            throw new RuntimeError('Failed to revoke certificate ' + sysId, e);
        }

        gs.info('Certificate: ' + sysId + ' revoked successfully. Session Token: ' + this._getSessionToken());
    },

    /**
     * Revokes a list of certificates.
     * @param {string[]} sysIds - An array of certificate sys_ids to revoke.
     * @param {string} reason - The reason for revocation.
     * @throws {RuntimeError} If any of the revocations fail.
     */
    revokeCertificates: function(sysIds, reason) {
        this._getValidationUtil().validateNonEmptyStringArray(sysIds, 'sysIds', true);
        this._getValidationUtil().validateNonEmptyString(reason, 'reason', true);

        for (var i = 0; i < sysIds.length; i++) {
            this.revokeCertificate(sysIds[i], reason);
        }
    },

    /**
     * Signs CSR and optionally formats the response certificate.
     * @param {string} csr - The certificate signing request.
     * @param {boolean} [formatted=true] - If true, returns the PEM-formatted certificate. Otherwise, returns the data as recieved from the endpoint.
     * @returns {string} The certificate data.
     * @throws {RuntimeError} If any part of the signing process fails.
     */
    signCertificate: function(csr, formatted) {
        this._getValidationUtil().validateNonEmptyString(csr, 'csr', true);
        if (formatted != null)
            this._getValidationUtil().validateBoolean(formatted, 'formatted', true);

        var validationResponse = this.endpoint.signCertificate(csr);
        if (!validationResponse)
            throw new RuntimeError('No response from CSR Validation endpoint sign certificate');

        var leafCertJson;
        try {
            leafCertJson = JSON.parse(validationResponse);
        } catch (e) {
            throw new RuntimeError('Failed to parse validation response', e);
        }

        if (!leafCertJson || !leafCertJson.success) {
            gs.error('CSR Validation failed. Validation Response:' + validationResponse);
            throw new RuntimeError('CSR Validation failed. Ensure the csr content is valid.');
        }
        
        gs.debug('CSR signed successfully. Session Token: ' + this._getSessionToken());

        var leafCert = leafCertJson.data;
        if (formatted !== false && !leafCert.startsWith('-----BEGIN CERTIFICATE-----')) {
            leafCert = '-----BEGIN CERTIFICATE-----\n' + leafCert.replace(/.{64}/g, '$&\n').trim() + '\n-----END CERTIFICATE-----';
        }

        return leafCert;
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

    type: 'CsrValidationEndpoint'
};
