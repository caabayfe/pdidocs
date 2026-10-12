(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var chat_channel_id = 'ea0cb816732110104a905ee515f6a7b5';
    var userTable = gs.nil(request.queryParams.user_table) ? null : request.queryParams.user_table;
    var userDocument = gs.nil(request.queryParams.user_document) ? null : request.queryParams.user_document;
    var agentPhoneNumber = request.queryParams.agent_phone_number;
    var clientPhoneNumber = request.queryParams.client_phone_number;
    var channelSysId = gs.nil(request.queryParams.channel_sys_id) ? null : request.queryParams.channel_sys_id;
    var result = {};

    if (channelSysId == chat_channel_id) {
        result = sn_cs.AsyncChatSetupScriptObject.validateChannelProfile(userTable, userDocument, clientPhoneNumber);
    } else {
        result = sn_cs.MessageSetupScriptObject.validateChannelProfile(userTable, userDocument, agentPhoneNumber, clientPhoneNumber, channelSysId);
    }
    var interactionGr = result.interaction;
    var profileMatching = result.profile_matching;
    var otherProfileMatching = result.other_profile_matching;
    if (result) {
        const responseObject = {
            'profile_matching': profileMatching,
            'interaction': interactionGr ? constructInteractionData(interactionGr) : null,
            'other_profile_matching': otherProfileMatching,
            'other_profile_record': interactionGr ? constructOtherProfileRecord(interactionGr) : null,
            'session_user_id': gs.getUserID()
        };

        if (result.successful) {
            response.setBody(responseObject);
            response.setStatus(200);
        } else {
            response.setBody(responseObject);
            response.setStatus(200);
        }
    } else {
        response.setStatus(500);
    }

})(request, response);

function constructInteractionData(interactionGr) {
    let res = null;
    if (!gs.nil(interactionGr.getValue('sys_id'))) {
        res = {
            number: interactionGr.getValue('number'),
            sys_id: interactionGr.getValue('sys_id'),
            sys_updated_on: interactionGr.getValue('sys_updated_on'),
            opened_for: {
                name: interactionGr.opened_for ? interactionGr.opened_for.name : null,
                sys_id: interactionGr.opened_for ? interactionGr.opened_for.sys_id : null
            },
            assigned_to: {
                name: gs.nil(interactionGr.assigned_to.name) ? null : interactionGr.assigned_to.name,
                sys_id: gs.nil(interactionGr.assigned_to) ? null : interactionGr.assigned_to.sys_id
            },
            subtype: interactionGr.getValue('subtype'),
            contact: {
                name: gs.nil(interactionGr.contact.name) ? null : interactionGr.contact.name,
                sys_id: gs.nil(interactionGr.contact) ? null : interactionGr.contact.sys_id
            },
            consumer: {
                name: gs.nil(interactionGr.consumer.name) ? null : interactionGr.consumer.name,
                sys_id: gs.nil(interactionGr.consumer) ? null : interactionGr.consumer.sys_id
            },
            agent_chat: interactionGr.getValue('agent_chat') === 'true' || interactionGr.getValue('agent_chat') === '1'
        };

        const cafLAUtils = new global.CAFLiveAgentUtils();
        const providerApplicationId = cafLAUtils.getProviderApplicationFromInteraction(interactionGr.getUniqueValue());

        if (providerApplicationId) {
            const propValues = cafLAUtils.fetchCapabilityValue(providerApplicationId, [
                'third_party_chat',
                'live_agent_multi_party_chat',
                'live_agent_end_va_conversation'
            ]);

            for (const propName in propValues) {
                res[propName] = !gs.nil(propValues[propName]) ?
                    propValues[propName] === 'true' :
                    CAFLiveAgentConstants.CAPABILITIES[propName]?.defaultValue;
            }
        }
    }

    return res;
}

function constructOtherProfileRecord(interactionGr) {
    var res = null;
    if (!gs.nil(interactionGr.channel_user_profile.display_name)) {
        res = {
            display_name: interactionGr.channel_user_profile.display_name,
            id: interactionGr.channel_user_profile.channel_user_id
        };
    }
    return res;
}
