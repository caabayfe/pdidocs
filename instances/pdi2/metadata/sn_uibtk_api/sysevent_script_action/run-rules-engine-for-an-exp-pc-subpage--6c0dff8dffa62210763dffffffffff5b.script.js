 var {
     RuleChecker
 } = require('@devsnc/uibtk-api');
 var rc = new RuleChecker();
 try {
     var payload = JSON.parse(event.parm1);
     var isMaint = payload?.isMaint;
     var type = payload.type;
     var appRoutes = {};
     switch (type) {
         case 'experience':
             var experienceId = payload?.experienceId;
             appRoutes = rc.checkAllRulesAgainstExperience(experienceId, isMaint);
             gs.publish("/sn/uib/builder/assistant", {
                 appRoutes,
                 experienceId,
                 type
             });
             break;
         case 'pc':
             var extensionPointId = payload?.extensionPointId;
             appRoutes = rc.checkAllRulesAgainstPc(extensionPointId, isMaint);
             gs.publish("/sn/uib/builder/assistant", {
                 appRoutes,
                 extensionPointId,
                 type
             });
             break;
     }
 } catch (err) {
     gs.error(err);
 }
