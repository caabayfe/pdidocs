(function(context, pageParams, blockcontext) {
    // return some_output
    var util = new sn_instance_clone.AdminCloneUtil();
    //fetching clone profile details
    var output = {};
    var record = util.getCloneProfileDefaultRecord();
    var isSysProfile = false;

    if (pageParams.sysId != -1) {
        record = util.getCloneProfileRecord(pageParams.sysId);
        //footer buttons show/hide
        output.showReset = false;
        output.showAdd = false;
        output.isDiffScope = record.isDiffScope;
        output.diffScopeMsg = record.diffScopeMsg;
        if (pageParams.sysId == CloneConstants.SYSTEM_PROFILE_SYS_ID) {
            output.disableComponents = true;
            isSysProfile = true;
        } else if(record.isDiffScope) {
            output.disableComponents = true;
        } else {
            output.disableComponents = false;
        }
    } else {
        output.disableComponents = false;
        output.showUpdate = false;
        output.showDelete = false;
        output.showDefinitions = false;
        output.isDiffScope = false;
    }
    //output.cloneProfileData = record;
    for (item in record) {
        output[item] = record[item];
    }
    if(isSysProfile) {
        output.isDiffScope = false;
    }
    //fetching target instances
    output.targetInstances = util.getTargetInstances(false,true);
    //forming modal delete message
    output.modalDeleteMessage = output.modalDeleteMessageText + output.name + '?';
    
    var exclusions = output.exclusionsCount || 0;
    var preservers = output.preserversCount || 0;
    var cleanup = output.cleanupScriptsCount || 0;
    
    var exclusionsCountText = gs.getMessage('Exclusion ARIA label',[exclusions]); 
    var preserversCountText = gs.getMessage('Preserver ARIA label',[preservers]);
    var cleanupScriptsCountText = gs.getMessage('CleanupScript ARIA label',[cleanup]);
    // --- ARIA Attributes ---
    function getAria(label) {
        return {
            button: {
                role: label,
                "aria-label": label
            }
        };
    }
    output.exclusionsAriaAttributes = getAria(exclusionsCountText);
    output.preserversAriaAttributes = getAria(preserversCountText);
    output.cleanupScriptsAriaAttributes = getAria(cleanupScriptsCountText);
    return output;
})(context, pageParams, blockcontext);
