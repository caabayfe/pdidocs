var PayloadEncrypter = Class.create();
PayloadEncrypter.prototype = {
    initialize: function() {},

    /**
     * @param {string} midSysId        - sys_id of the ecc_agent record for the target MID server.
     * @param {string} registrationKey - The randomly generated registration key.
     * @param {string} userSysId       - The sys_id of the user associated with this MID server.
     * @returns {string} Serialized encrypted XML string, or null on failure.
     */
    encryptPayload: function(midSysId, registrationKey, userSysId) {
        gs.info('PayloadEncrypter.encryptPayload() was called', 'PayloadEncrypter');

        try {
            var escapeXml = function(s) {
                return String(s)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            };
            var plaintext = '<credentials>'
                + '<registration_key>' + escapeXml(registrationKey) + '</registration_key>'
                + '<user_sys_id>'      + escapeXml(userSysId)       + '</user_sys_id>'
                + '</credentials>';
            return new MIDServerCredentialEncrypter().encrypt(midSysId, plaintext);
        } catch (e) {
            gs.error('PayloadEncrypter.encryptPayload() failed: ' + e, 'PayloadEncrypter');
            return null;
        }
    },

    type: 'PayloadEncrypter'
};
