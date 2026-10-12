(function(context, pageParams, blockcontext) {
    // return some_output
    try {
        var diagn_util = new sn_nowassist_diagn.NowAssistAdminDiagnosticUtil();
        var skillId = blockcontext.troubleshootSkillId;
        var dataArr = diagn_util.getTroubleshootPresentationalListData(skillId);
        var resultArray = [];
        dataArr.forEach(function(data) {
            resultArray = resultArray.concat(data?.resultArr);
        });
        resultArray.forEach(function(result) {
            var msg = result.message;
            try {
                var index = msg.indexOf(':');
                var label = msg.substring(0, index);
                var jsonObj = msg.substring(index + 1).trim();
                var jsonParseObj = JSON.parse(jsonObj);
                msg = jsonParseObj.message;
                if(gs.nil(msg)){
                    msg = label;
                }
            } catch (error) {}
            result.message = msg;
            result.resolution = gs.getMessage("Recommended action : {0}", result.resolution);
        });
        
        
        var troubleshootResult = {};
        if(resultArray?.length > 0){
            troubleshootResult = {
                heading : gs.getMessage("Diagnostic complete"),
                subHeading : gs.getMessage("Below are the diagnostic results for the skill, {0}", blockcontext.troubleshootSkillName),
                totalCount : gs.getMessage("Total ({0})", resultArray.length.toString()),
                resultArray : resultArray
            };
        }
        else{
            troubleshootResult = {
                heading : gs.getMessage("Diagnostic complete")
            };
        }
        return {
            showTroubleshootLoading: false,
            showTroubleshootResult: resultArray.length == 0 ? false : true,
            showEmptyResult: resultArray.length == 0 ? true : false,
            troubleshootErrorOccured: false,
            troubleshootResult: troubleshootResult, 
        };
    } catch (error) {

        gs.error("Error occurred in troubleshoot block: " + error);
        return {
            troubleshootErrorOccured: true,
            showTroubleshootLoading: false,
            showTroubleshootResult: false,
            showEmptyResult: false,
            troubleshootResult : {
                heading : gs.getMessage("Diagnostic Interrupted")
            },
        };
    }
})(context, pageParams, blockcontext);
