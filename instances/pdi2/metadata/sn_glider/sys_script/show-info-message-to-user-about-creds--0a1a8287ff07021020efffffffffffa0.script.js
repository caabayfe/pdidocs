(function executeRule(current, previous /*null when async*/) {

    gs.addInfoMessage(sn_i18n.Message.getMessage('glider_ide:git:credential_tips_info', "Git credentials are selected based on the most specific URL match. For example, 'https://gitprovider.com' matches 'https://gitprovider.com/owner/repo' using the most specific credentials available. If git provider is behind a firewall, MID Server should be configured in 'ecc_agent_application.do'."));

})(current, previous);
