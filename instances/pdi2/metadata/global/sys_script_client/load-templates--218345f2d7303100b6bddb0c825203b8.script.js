function onLoad() {
   //These are used by a few of the client scripts
	template_onBefore = "function onBefore(current, previous) {\r\n   //This function will be automatically called when this rule is processed.\r\n   \r\n}";
	template_onAfter = "function onAfter(current, previous) {\r\n   //This function will be automatically called when this rule is processed.\r\n   \r\n}";
	template_onAsync = "function onAsync(current) {\r\n   //This function will be automatically called when this rule is processed.\r\n   \r\n}";
	template_onDisplay = "function onDisplay(current, g_scratchpad) {\r\n   //This function will be automatically called when this rule is processed.\r\n   \r\n}";


   isDefaultTemplate = function(script) {
      var isMine = false;
      if (script == template_onBefore.replace(/\r/g, ""))
         isMine = true;
      if (script == template_onAfter.replace(/\r/g, ""))
         isMine = true;
      if (script == template_onAsync.replace(/\r/g, ""))
         isMine = true;
      if (script == template_onDisplay.replace(/\r/g, ""))
         isMine = true;
      if (script == '')
         isMine = true;
   
      return isMine;
   }
}
