var MidSystemCommandUtil = Class.create();
MidSystemCommandUtil.prototype = {
    initialize: function() {},

    /**
     * Issues a SystemCommand to a specific MID server with the given parameters.
     * @param {string} midName       - ecc_agent.name of the target MID server.
     * @param {string} commandName   - The system command name (e.g. 'RotateIPKI').
     * @param {Array}  parametersXML - Parameters array to pass to the command.
     */
    issueSystemCommand: function(midName, commandName, parametersXML) {
        new MIDServerSystemCommandUtil().issueSystemCommandToSpecificMID(commandName, midName, parametersXML);
    },

    /**
     * Issues a SystemCommand to a specific MID server with an encrypted payload as a parameter.
     * @param {string} midName       - ecc_agent.name of the target MID server.
     * @param {string} commandName   - The system command name (e.g. 'MigrateToIPKI').
     * @param {string} encryptedXml  - Serialized encrypted XML to pass as a parameter.
     */
    issueSecureSystemCommand: function(midName, commandName, encryptedXml) {
        var encryptedOuterPayloadBase64 = GlideStringUtil.base64Encode(encryptedXml);
        var parameters = [{ name: 'migration_key_payload_encrypted', value: encryptedOuterPayloadBase64, encrypted: false }];
        return new MIDServerSystemCommandUtil().issueSystemCommandToSpecificMID(commandName, midName, parameters);
    },

    type: 'MidSystemCommandUtil'
};
