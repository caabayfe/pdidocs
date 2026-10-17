function onLoad() {
   //Show the Enable Embeddables field only when UX Embeddables plugin is installed
   // Also, Enable embeddables field should not be enabled for MESP, Perf Analyser portal and SP Configuration portal
   var isEmbeddablesPluginInstalled = g_scratchpad.isEmbeddablesPluginInstalled;
   var restrictedPortals = ["26f2fffb77322300454792718a1061e5", "77181a4fb73302102c446f08ee11a9b7", "db57a91047001200ba13a5554ee49050"];
   var currentPortalSysId = g_form.getUniqueValue();
   if(isEmbeddablesPluginInstalled && !restrictedPortals.includes(currentPortalSysId)) {
	g_form.setVisible('enable_embeddables', true);
   } else {
	g_form.setVisible('enable_embeddables', false);
   }
}
