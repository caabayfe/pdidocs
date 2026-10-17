var VANotificationContentAPI = Class.create();
VANotificationContentAPI.prototype = {

    VALID_CONTENT_TYPE: ["Virtual Agent Content - Chat", "Virtual Agent Content - Messaging"],
    VALID_FORMAT_TYPE: "simple,record_card,image_card",
    TYPE_TO_TABLE_MAP: {
        'Virtual Agent Content - Chat': 'sys_notification_va_content',
        'Virtual Agent Content - Messaging': 'sys_notification_va_content_messaging'
    },

    initialize: function() {
        this.notificationGr = null;
    },

    /**
	* API to create or update VA chat or messaging content.
	* @param notificationId : valid notification (sys_notification) sys_id
	* @param paylaod: object contains valid required fields for creating the content. Example: 
	* 		{
				name: "Test Notification content", (mandatory)
				content_type: "Virtual Agent Content - Chat", (mandatory)
				active: true, (default true if not provided)
                sys_id: '2e3fc4cbe5a4a510f877ab77eb30e233', //If we want to update existing content. 
				format: {
					type: "record_card", (mandatory)
					fields: "task.short_description,task.state,task.urgency,ais_result.search_profle.name", (mandatory)
					enable_link:  false,
					customize_header: false,
					header_customization_script: "", //Only required if customize_header is true.					 
				},
				message: {
					advanced: false,
					message_heading: "",
					message: "Hi There!!", (mandatory)
					script: "", //Only required if advanced is true
				},
				//Only for content_type = Virtual Agent Content - Chat
				delivery_channels:"004a8122eb832010ad88ca5d235228bb,37263ba673b210104049dec2c4f6a77d,d257e4e9c3d310106c9a5230d840ddd2,ea0cb816732110104a905ee515f6a7b5" (mandatory),
				consumer_account_contexts:"e31471d9531121103296ddeeff7b1231,082319bec7612110967a34c91dc2603b" (optional. also, this is used only if above delivery_channels has mweb channel in it)
			}
	
	* @return {sys_id: "sys_id of new/updated content", message: "Any error message" }
	*/

    createOrUpdateVAContent: function(notificationId, payload) {

        this.notificationGr = VANotificationAPIHelper.getNotificationGr(notificationId);
        if (!this.notificationGr.isValidRecord(notificationId)) {
            return {
                sys_id: null,
                message: "Failed to create or update VA notification content. Invalid notification ID"
            };
        }

        var validationResult = this._validatePayloadAndCreateContentObject(payload);
        if (!validationResult.isValid) {
            return {
                sys_id: null,
                message: validationResult.message
            };
        }

        var contentSysId = this._insertOrUpdateContent(validationResult.contentObj);
        return {
            sys_id: contentSysId,
            message: ""
        };

    },

    /**
	* API to create or update delivery channel for a messaging content.
	* @param content ID : valid messaging content sys_id
	* @param paylaod: object contains valid required fields for creating the content. Example: 
	* 		{
  				connection: "3f51f7a3771700105d7b3882a910616d", (mandatory, sys_id of sys_cs_provider)
  				from_identity: "6ea159df21a02110f87790fada618943", (mandatory, sys_id of sys_cs_provider_application)
  				to_table: "task", (mandatory, table name)
  				to_field: "description", (field name from to_table)
				active: true, (default true if not provided)
  				sys_id: "25597dd321642110f87790fada6189bc" //If want to update existing content. 
}
	
	* @return {sys_id: "sys_id of new/updated channel", message: "Any error message" }
	*/
    createOrUpdateChannelForVAMessagingContent: function(contentId, payload) {

        if (!VANotificationAPIHelper.isVAContentValid(contentId)) {
            return {
                sys_id: null,
                message: "Failed to create or update channel for messaging content. Invalid content ID"
            };
        }

        var channelValidationResult = this._validateChannelPayloadAndCreateChannelObj(payload);
        if (!channelValidationResult.isValid) {
            return {
                sys_id: null,
                message: channelValidationResult.message
            };
        }
        channelValidationResult.channelObj.notification_content = contentId;
        var channelSysId = this._insertOrUpdateMessagingChannel(channelValidationResult.channelObj);

        return {
            sys_id: channelSysId,
            message: ""
        };

    },

    getDefaultConsumerAccountContext: function() {
        var consumerAccountContextGR = new GlideRecord('sys_cs_consumer_account_context');
        consumerAccountContextGR.addQuery('is_default', true);
        consumerAccountContextGR.query();

        if (consumerAccountContextGR.next())
            return consumerAccountContextGR.getValue('sys_id');

        return '';
    },

    /**
    * From the list of consumer account context sysids that are passed as argument, return a subset of 
    * sysIds that are valid consumer account contexts.
    * 
    * @param consumerAccountContexts : comma separated list of consumer account sysids
    * @return validConsumerAccounts : comma separated list with a subset of valid consumer account sysids
    */
    getValidConsumerAccountContexts: function(consumerAccountContexts) {
        // split the context sysids into an array and DB search with them
        var consumerAccountContextsArr = consumerAccountContexts.split(',');
        var consumerAccountContextGR = new GlideRecord('sys_cs_consumer_account_context');
        consumerAccountContextGR.addQuery("sys_id", "IN", consumerAccountContextsArr);
        consumerAccountContextGR.query();
		
        var validConsumerAccountContexts = [];
        while (consumerAccountContextGR.next()) {
			validConsumerAccountContexts.push(consumerAccountContextGR.getValue("sys_id"));
		}
        return validConsumerAccountContexts.join(",");
    },

    _validateChannelPayloadAndCreateChannelObj: function(payload) {
        var channelObj = {};
        if (!gs.nil(payload.sys_id)) {
            if (!VANotificationAPIHelper.isDeliveryChannelValid(payload.sys_id)) {
                return {
                    sys_id: null,
                    message: "Failed to create or update channel for messaging content. Invalid channel ID"
                };
            }
            channelObj.sys_id = payload.sys_id;
        }
        channelObj.active = gs.nil(payload.active) ? true : payload.active;

        if (gs.nil(payload.connection) || !VANotificationAPIHelper.isProviderChannelValidForMessagingContent(payload.connection)) {
            return {
                sys_id: null,
                message: "Failed to create or update channel for messaging content. Invalid provider channel"
            };
        }
        channelObj.connection = payload.connection;

        if (gs.nil(payload.from_identity) || !VANotificationAPIHelper.isProviderChannelIdentityValidForConnection(payload.from_identity, payload.connection)) {
            return {
                sys_id: null,
                message: "Failed to create or update channel for messaging content. Invalid provider channel identity"
            };
        }
        channelObj.from_identity = payload.from_identity;

        if (gs.nil(payload.to_table) || !VANotificationAPIHelper.isTableValid(payload.to_table)) {
            return {
                sys_id: null,
                message: "Failed to create or update channel for messaging content. Invalid to_table"
            };
        }
        channelObj.to_table = payload.to_table;

        if (!gs.nil(payload.to_field) && !this._checkValidFieldInATable(payload.to_table, payload.to_field).isFieldValid) {
            return {
                sys_id: null,
                message: "Failed to create or update channel for messaging content. Invalid to_field"
            };
        }
        channelObj.to_field = payload.to_field;

        return {
            isValid: true,
            channelObj: channelObj
        };
    },

    _validatePayloadAndCreateContentObject: function(payload) {
        var contentObj = {};

        if (gs.nil(payload.name)) {
            return {
                isValid: false,
                message: "Failed to create or update VA notification content. Invalid name"
            };
        }
        contentObj.name = payload.name.trim();
        contentObj.notification = this.notificationGr.getUniqueValue();
        contentObj.active = gs.nil(payload.active) ? true : payload.active;
        if (!gs.nil(payload.sys_id)) {
            if (!VANotificationAPIHelper.isVAContentValid(payload.sys_id)) {
                return {
                    isValid: false,
                    message: "Failed to create or update VA notification content. Invalid content id"
                };
            }
            contentObj.sys_id = payload.sys_id;
        }

        //Check for content_type only for insertion case.
        if (gs.nil(contentObj.sys_id) && (gs.nil(payload.content_type) || this.VALID_CONTENT_TYPE.indexOf(payload.content_type.trim()) === -1)) {
            return {
                isValid: false,
                message: "Failed to create or update VA notification content. Invalid content_type"
            };
        }
        contentObj.content_type = gs.nil(contentObj.sys_id) ? payload.content_type.trim() : VANotificationAPIHelper.getVAContentType(contentObj.sys_id);


        //check if an active content already exists for content_type only when inserting/updating active content. 
        if (contentObj.active && VANotificationAPIHelper.isActiveContentExist(contentObj.notification, contentObj.content_type, contentObj.sys_id)) {
            return {
                isValid: false,
                message: "Failed to create or update VA notification content. An active content already exist of type " + contentObj.content_type
            };
        }

        var formatValidationResult = this._validateFormatAndUpdateContentObj(payload.format, contentObj);
        if (!formatValidationResult.isValid)
            return formatValidationResult;

        var messageValidationResult = this._validateMessageAndUpdateContentObj(payload.message, contentObj);
        if (!messageValidationResult.isValid)
            return messageValidationResult;

        //insert case: contentObj.sys_id is null. Update case: contentObj.sys_id not null and delivery_channels are not null. 
        //no change in delivery channel if delivery channels are not provided for update scenario. 
        if (contentObj.content_type === 'Virtual Agent Content - Chat' && (gs.nil(contentObj.sys_id) || !gs.nil(payload.delivery_channels))) {
            if (gs.nil(payload.delivery_channels)) {
                contentObj.delivery_channels = VANotificationAPIHelper.getAllChatChannels();
            } else {
                if (!VANotificationAPIHelper.areChannelsValid(payload.delivery_channels)) {
                    return {
                        isValid: false,
                        message: "Failed to create or update VA notification content. Invalid channels"
                    };
                }
                contentObj.delivery_channels = payload.delivery_channels;
            }
        }

        // if multiple conversations across portals feature is enabled and if the delivery channels 
        // contains mweb, then a consumer account context needs to be set.
        // if valid contexts are present in the payload, set them into the contentObj. If no 
        // valid context present, set the default context into the contentObj.
        var response = VANotificationAPIHelper.doesMwebChannelSupportMultipleConversations();
        if (response.mwebSupportMultipleConversations) {
            var mwebChannelSysId = response.sysId;
            var isMwebChannelPresent = payload.delivery_channels.includes(mwebChannelSysId);
            if (isMwebChannelPresent) {
                if (gs.nil(payload.consumer_account_contexts)) {
                    // contexts not specified, use the default context
                    contentObj.consumer_account_contexts = this.getDefaultConsumerAccountContext();
                } else {
                    // add the specified contexts are valid
                    var validConsumerAccountContexts = this.getValidConsumerAccountContexts(payload.consumer_account_contexts);
                    if (!gs.nil(validConsumerAccountContexts)) {
                        contentObj.consumer_account_contexts = validConsumerAccountContexts;
                    } else {
                        contentObj.consumer_account_contexts = this.getDefaultConsumerAccountContext();
                    }
                }
            } else {
                // it is possible there was mweb in delivery channels earlier. so explicitly make it empty
                contentObj.consumer_account_contexts = '';
            }
        }

        return {
            isValid: true,
            contentObj: contentObj
        };
    },

    _validateFormatAndUpdateContentObj: function(format, contentObj) {

        if (!gs.nil(contentObj.sys_id) && gs.nil(format)) {
            //In update case if format is not provided, we will not update format type. 
            return {
                isValid: true
            };
        }

        //Validating format for insertion or update case. 
        if (gs.nil(format) || gs.nil(format.type) || !this.VALID_FORMAT_TYPE.includes(format.type)) {
            return {
                isValid: false,
                message: "Failed to create or update VA notification content. Invalid format type."
            };
        }
        contentObj.type = format.type;

        if (format.type == "record_card") {
            if (gs.nil(format.fields) || !this._validateFields(this.notificationGr.getValue('table'), format.fields)) {
                return {
                    isValid: false,
                    message: "Failed to create or update VA notification content. Invalid table fields."
                };
            }

            contentObj.fields = format.fields;
            contentObj.send_link = gs.nil(format.enable_link) ? false : format.enable_link;
            contentObj.customize_header = gs.nil(format.customize_header) ? false : format.customize_header;
            if (contentObj.customize_header) {
                if (gs.nil(format.header_customization_script)) {
                    return {
                        isValid: false,
                        message: "Failed to create or update VA notification content. Invalid header customization script"
                    };
                }
                contentObj.header_customization_script = format.header_customization_script;
            }
        }

        if (format.type == "image_card") {
            if (gs.nil(format.image_url)) {
                return {
                    isValid: false,
                    message: "Failed to create or update VA notification content. Invalid image url"
                };
            }
            contentObj.image_source = "url";
            contentObj.image_url = format.image_url;
            contentObj.image_alt_text = gs.nil(format.image_alt_text) ? "" : format.image_alt_text;
        }
        return {
            isValid: true,
        };
    },

    _validateMessageAndUpdateContentObj: function(message, contentObj) {

        if (!gs.nil(contentObj.sys_id) && gs.nil(message)) {
            //In update case if message is not provided, we will not update message. 
            return {
                isValid: true
            };
        }

        //Validating message for insertion or update case. 
        if (gs.nil(message)) {
            return {
                isValid: false,
                message: "Failed to create or update VA notification content. Invalid message."
            };
        }

        contentObj.advanced = gs.nil(message.advanced) ? false : message.advanced;
        if (contentObj.advanced) {
            if (gs.nil(message.script)) {
                return {
                    isValid: false,
                    message: "Failed to create or update VA notification content. Invalid message script"
                };
            }
            contentObj.script = message.script;
        } else {
            if (gs.nil(message.message)) {
                return {
                    isValid: false,
                    message: "Failed to create or update VA notification content. Invalid message"
                };
            }
            contentObj.message = message.message;
            contentObj.message_heading = gs.nil(message.message_heading) ? "" : message.message_heading;
        }
        return {
            isValid: true,
        };
    },

    _validateFields: function(tableName, fields) {

        var fieldsArr = fields.split(',');
        if (!fieldsArr.length)
            return false;

        var fieldValidationResult;

        for (var i = 0; i < fieldsArr.length; i++) {
            var table = tableName;
            var dotWalkingFields = fieldsArr[i].split(".");

            while (dotWalkingFields.length) {
                var field = dotWalkingFields.shift();
                fieldValidationResult = this._checkValidFieldInATable(table, field);
                if (!fieldValidationResult.isFieldValid)
                    return false;
                table = fieldValidationResult.tableName;
            }
        }

        return true;
    },

    _checkValidFieldInATable: function(table, field) {
        var tableGr = new GlideRecord(table);
        tableGr.initialize();

        if (tableGr.isValid() && tableGr.isValidField(field)) {
            var elem = tableGr.getElement(field);
            return {
                isFieldValid: true,
                tableName: elem.getReferenceTable() || ""
            };
        }

        return {
            isFieldValid: false,
            tableName: ""
        };
    },

    _insertOrUpdateContent: function(contentObj) {
        var contentGr = new GlideRecordSecure(this.TYPE_TO_TABLE_MAP[contentObj.content_type]);
        contentGr.initialize();

        if (contentObj.sys_id)
            contentGr.get(contentObj.sys_id);

        for (var key in contentObj)
            contentGr.setValue(key, contentObj[key]);

        return contentGr.update();
    },

    _insertOrUpdateMessagingChannel: function(channelObj) {
        var channelGr = new GlideRecordSecure("sys_cs_notification_delivery_channel");
        channelGr.initialize();

        if (channelObj.sys_id)
            channelGr.get(channelObj.sys_id);

        for (var key in channelObj)
            channelGr.setValue(key, channelObj[key]);

        return channelGr.update();
    },

    type: 'VANotificationContentAPI'

};
