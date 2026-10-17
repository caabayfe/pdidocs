validateGlobalBusinessRule(current);

function validateGlobalBusinessRule(gbr) {
   //first, make execute_function false because it doesn't make sense for global rules
   current.setValue('execute_function', false);
   
   var gbrName = gbr.name;
   var script = gbr.script;
   var hs = hasFunction(script);
   if (hs == false)
      notify(gbrName);
   else {
      var strippedScript = removeCommentsFromScript(script);
      hs = hasFunction(strippedScript);
      if (hs == false) {
         // Can't find "function" then no declaration exists
         notify(gbrName);
      } else {
		 // Strip functions
         var functions = strippedScript.split("function ");
         for (var i = 0; i < functions.length-1; i++) {
            var fi_start = strippedScript.indexOf("function ", 0);
			if (fi_start == -1)
			   break;

            var fi_next = strippedScript.indexOf("function ", fi_start+1);
			var fi_end = strippedScript.length;
			if (fi_next != -1) {
			   var f1 = strippedScript.slice(fi_start, fi_next);
			   fi_end = f1.lastIndexOf("}");
			}
            fi_end = fi_start + fi_end + 1;
            var before = "";
            if (fi_start != 8)
               before = strippedScript.substring(0, fi_start);

            var after = strippedScript.substring(fi_end);
            strippedScript = before + "" + after;
         }

		 // Line Breaks
         if (JSUtil.notNil(strippedScript))
            strippedScript = strippedScript.replace(/\s+/g," ");

		 // Trim
         if (JSUtil.notNil(strippedScript))
            strippedScript = strippedScript.trim();

		 // If not empty we must have code outside of a function
         if (JSUtil.notNil(strippedScript))
            notify(gbrName);
      }
   }
}

function removeCommentsFromScript(script) {
   var pattern1 = /\/\*(.|[\r\n])*?\*\//g;
   script = script.replace(pattern1,"");
   var pattern2 = /\/\/.*/g;
   script = script.replace(pattern2,"");
   return script;
}

function hasFunction(str) {
   if (str.indexOf("function") == -1)
      return false;
   
   return true;
}

function notify(gbrName) {
   gs.addInfoMessage(gs.getMessage("global_rule_function_check", gbrName));
}
