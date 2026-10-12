var MobileFieldEncryptor = Class.create();
MobileFieldEncryptor.prototype = {
  initialize: function () {
    this.errorHandler = new sn_mab_api.ErrorHandler();
    this.cryptoModules = {
      sys_sg_custom_map_provider: {
        map_provider_app_secret:
          'global.com_glide_sg_custom_map_glideencrypter',
        location_provider_app_secret:
          'global.com_glide_sg_custom_map_glideencrypter',
      },
    };
  },

  containsCryptoKey: function (table, field) {
    return this.cryptoModules[table] && this.cryptoModules[table][field];
  },

  encrypt: function (table, field, value) {
    if (this.containsCryptoKey(table, field)) {
      var cryptoModuleName = this.cryptoModules[table][field];
      var op = new sn_kmf_ns.KMFCryptoOperation(
        cryptoModuleName,
        'SYMMETRIC_WRAPPING'
      ).withAlgorithm('AES');

      return op.doOperation(value);
    }

    this.errorHandler.throwBadRequestError(
      'No encryption key available for password2 field ' +
        field +
        ' on table ' +
        table
    );
  },

  type: 'MobileFieldEncryptor',
};

module.exports = MobileFieldEncryptor;
