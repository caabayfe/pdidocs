try {
    var LIVE_AGENT_END_CONVERSATION_CAPABILITY = "live_agent_end_va_conversation";
    var THIRD_PARTY_CHAT_CAPABILITY = "third_party_chat";

    var insertCAFProperty = function(providerAppId) {
        var description = "Indicates whether a VA conversation can be terminated from ServiceNow instance side when external partner systems are capable of ending their parallel interaction.";

        var cafPropertyGr = new GlideRecord('sys_cs_custom_adapter_property');
        cafPropertyGr.setValue('name', LIVE_AGENT_END_CONVERSATION_CAPABILITY);
        cafPropertyGr.setValue('value', true);
        cafPropertyGr.setValue('description', description);
        cafPropertyGr.setValue('document_record', providerAppId);
        cafPropertyGr.setValue('document_table', 'sys_cs_provider_application');
        cafPropertyGr.insert();
    };

    // Collect provider applications with "third_party_chat" and/or "live_agent_end_va_conversation" capabilities
    var providerAppsWithThirdPartyChat = {};
    var providerAppsWithCanEndConversation = {};

    var adapterPropsAggregate = new GlideAggregate("sys_cs_custom_adapter_property");
    adapterPropsAggregate.addQuery("name", "IN", [THIRD_PARTY_CHAT_CAPABILITY, LIVE_AGENT_END_CONVERSATION_CAPABILITY]);
    adapterPropsAggregate.groupBy("document_record");
    adapterPropsAggregate.groupBy("name");
    adapterPropsAggregate.query();

    while (adapterPropsAggregate.next()) {
        var providerId = adapterPropsAggregate.getValue("document_record");
        var name = adapterPropsAggregate.getValue("name");

        if (name === THIRD_PARTY_CHAT_CAPABILITY) {
            providerAppsWithThirdPartyChat[providerId] = true;
        } else if (name === LIVE_AGENT_END_CONVERSATION_CAPABILITY) {
            providerAppsWithCanEndConversation[providerId] = true;
        }
    }

    // Insert missing "live_agent_end_va_conversation" capability
    var scanned = 0;
    var inserted = 0;

    for (var pId in providerAppsWithThirdPartyChat) {
        scanned++;

        if (providerAppsWithCanEndConversation[pId]) {
            continue; // already has "live_agent_end_va_conversation" capability
        }

        insertCAFProperty(pId);

        inserted++;

        // Progress logging every 200 inserts
        if (inserted % 200 === 0) {
            gs.info("Inserted " + inserted + " properties so far...");
        }
    }

    gs.info("Provider applications evaluated = " + scanned + ", inserted = " + inserted);
} catch (error) {
    gs.error("Error in executing Agent Initiated Messaging fix script: " + error);
}
