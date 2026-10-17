(function(context, pageParams) {

    var util = new sn_instance_clone.AdminCloneUtil();

    //fetching clone request ids
    context.props_details.cloneRequestId = util.getCloneRequestId();

    //fetching target instances
    context.props_details.targetInstances = util.getTargetInstances();

    //fetching source instances
    context.props_details.sourceInstances = util.getSourceInstances();

    //fetching clone profiles
    context.props_details.cloneProfiles = util.getCloneProfiles();

    //fetch system clone profile
    var _cloneProfile = context.props_details.cloneProfiles.find(function(el) { return el.isDefault == '1';});
    context.props_details.preSelectedDefaultProfile = _cloneProfile ? _cloneProfile.id : '';
    context.props_details.cloneProfileData = util.getCloneProfileRecord(context.props_details.preSelectedDefaultProfile);

    //fetching sys users
    context.props_details.users = util.getSysUsers("");

    //fetching current user
    context.props_details.current_user = util.getCurrentUserDetails();

    //fetching clone request data
    var cloneRequestData = util.getCloneRequestData();
    context.props_details.frequencyCard = cloneRequestData.frequencyCard;
    context.props_details.backupTypeFromCloneRequest = cloneRequestData.backupTypeForCloneRequestItems;
    context.props_details.backupTypeFromCloneProfile = cloneRequestData.backupTypeForCloneProfileItems;
    context.props_details.estimatedDurationInfoMessage = cloneRequestData.estimatedDurationInfoMessage;
    context.props_details.estimatedDurationLabel = cloneRequestData.estimatedDurationLabel;
    context.props_details.successModalInfoMessage = cloneRequestData.successModalInfoMessage;
    context.props_details.authenticateTargetHeader = cloneRequestData.authenticateTargetHeader;
    context.props_details.today = cloneRequestData.today;
    context.props_details.timeZone = cloneRequestData.timeZone;
    context.props_details.errorMessage = cloneRequestData.errorMessage;
    context.props_details.dataCopyItems = cloneRequestData.dataCopyItems;
    context.props_details.updateSetItems = cloneRequestData.updateSetItems;
    context.props_details.text = cloneRequestData.text;
})(context, pageParams);
