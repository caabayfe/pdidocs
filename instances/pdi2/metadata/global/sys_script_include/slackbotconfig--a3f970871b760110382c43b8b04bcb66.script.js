var SlackBotConfig = Class.create();
SlackBotConfig.prototype = {
    initialize: function() {
		this.logger = new GlideChatbotLoggerSetupUtil("com.glide.cs").setup();
	},
    getSlackBots: function() {
        var configObj = {};
        var customBots = [];
        var oobBots = [];
        var providerGr = new GlideRecord('sys_cs_provider_application');
        providerGr.addEncodedQuery('provider=41a04c42731210104049dec2c4f6a706');
        providerGr.query();
        while (providerGr.next()) {
            var inboundToken = this.getInboundId(providerGr.message_auth);


            if (JSUtil.notNil(inboundToken)) {
                if (this.isProductionBot(inboundToken)) {
                    oobBots.push(providerGr.getUniqueValue());
                } else {
                    customBots.push(providerGr.getUniqueValue());
                }

            }

        }
        configObj['oobBots'] = oobBots;
        configObj['customBots'] = customBots;
        return configObj;
    },

    getInboundId: function(auth) {
        var inboundToken = '';
        var encr = new GlideEncryptionUtil();
        var inboundIdClass = auth.inbound_message_verification.sys_class_name;
        if (inboundIdClass == 'token_verification')
            inboundToken = encr.getClearPassword2('token_verification', 'token', auth.inbound_message_verification);
        else if (inboundIdClass == 'hash_message_verification')
            inboundToken = encr.getClearPassword2('hash_message_verification', 'secret', auth.inbound_message_verification);
        return inboundToken;

    },

    isProductionBot: function(inboundId) {
        if (!inboundId || inboundId == undefined) return false;
        return inboundId.startsWith('slack_va');
    },
    recordAlreadyExist: function(id) {
        var imageExist, propertyExist;
        var propsGr = new GlideRecord('sys_cs_custom_adapter_property');
        propsGr.addQuery('document_record', id);
        propsGr.addQuery('name', 'bot_icon');
        propsGr.query();
        propertyExist = propsGr.getRowCount() > 0;

        var imageGr = new GlideRecord('db_image');
        var imageName = 'slack_' + id + '.png';
        imageGr.addQuery('name', imageName);
        imageGr.query();
        imageExist = imageGr.getRowCount() > 0;
        return imageExist && propertyExist;
    },
    createPropertyRecords: function(id, field) {
        var customPropsGr = new GlideRecord('sys_cs_custom_adapter_property');
        customPropsGr.initialize();
        customPropsGr.setValue('name', field);
        customPropsGr.setValue('document_record', id);
        customPropsGr.setValue('document_table', 'sys_cs_provider_application');
        customPropsGr.insert();
    },
    createDbImage: function(id) {
        var name = 'slack_' + id + '.png';
        var dbImageGr = new GlideRecord('db_image');
        dbImageGr.initialize();
        dbImageGr.setValue('name', name);
        dbImageGr.insert();
    },
    createRecords: function() {
        var oobBotsIds = this.getSlackBots().oobBots;
        if (oobBotsIds && oobBotsIds.length > 0) {
            oobBotsIds.forEach(function(id) {
                if (!this.recordAlreadyExist(id)) {
                    this.createPropertyRecords(id, 'bot_name');
                    this.createPropertyRecords(id, 'bot_icon');
                    this.createDbImage(id);
                }
            }, this);

        } else {
            this.logger.info('No Slack Production bot installed');
            return;
        }
    },
    type: 'SlackBotConfig'
};
