function /*void*/ onSend( /*String*/ channel, /*Map<String, Object>*/ message, /*String*/ sender) {
    gs.include("j2js");

    new sn_wwna.WWNAMobileCallbackHandler().process(channel, j2js(message), sender);
}
