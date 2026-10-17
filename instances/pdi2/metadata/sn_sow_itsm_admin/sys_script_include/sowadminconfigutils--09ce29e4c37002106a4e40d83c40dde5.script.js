var SOWAdminConfigUtils = Class.create();
SOWAdminConfigUtils.prototype = {
    initialize: function() {
    },

	TABLE: 'sn_sow_cfg_stg',

	retrieveConfigurationData: function(configSettingsKey) {
		var response = {};
		var statusCode = 200;
		var message = 'Successful';

		try {
			configGr = this.getConfigurationByKey(configSettingsKey);
			if (configGr.next()) {
				response.active = configGr.getValue('active') === '1' ? true : false;
				response.data = JSON.parse(configGr.getValue('value'));
			} else {
				statusCode = 404;
				message = 'No default settings configured';
			}
		} catch (error) {
            message = error.message;
            statusCode = 404;
			gs.error('Error while retrieving default timeline settings: ' + error);
        }
		response.statusCode = statusCode;
		response.message = message;
		return response;
	},

	updateConfigurationData: function(input) {
		var response = {};
		var configSettingsKey;
		var statusCode = 404;
		var message = 'Failed to update the record';

		try {
			configSettingsKey = input.configSettingsKey;
			var configData = input.configuration;

			var configGr = this.getConfigurationByKey(configSettingsKey);

			if (configGr.next()) {
				configGr.setValue('value', JSON.stringify(configData));
				configGr.setValue('active', true);
				var status = configGr.update();
				if (status) {
					message = 'Update Successful';
					statusCode = 200;
				}
			} else
				message = 'No default settings found';
		} catch (error) {
			gs.error('SOWAdminConfigUtils.updateConfigurationData :: Error while updating the configuration' + error);
        }
		response.statusCode = statusCode;
		response.message = message;
		return response;
	},

	getConfigurationByKey: function(key) {
		var gr = new GlideRecord(this.TABLE);
		gr.addQuery('key', key);
		gr.query();
		return gr;
	},

	getConfigurationBySysId: function(sysId) {
		var gr = new GlideRecordSecure(this.TABLE);
		gr.get(sysId);
		return gr;
	},

	isActiveConfiguration: function(name) {
		try {
			var gr = new GlideRecordSecure(this.TABLE);
			var qc = gr.addQuery('key', name);
			qc.addCondition('active', true);
			gr.query();
			
			if (gr.next()) {
				var value = JSON.parse(gr.getValue('value'));
				if (!gs.nil(value))
					return true;
			}
		} catch (error) {
			gs.error('Error while retrieving default timeline settings: ' + error);
		}
		return false;
	},

    type: 'SOWAdminConfigUtils'
};
