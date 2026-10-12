(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    function getUserData(userSysId, userName) {
        var aesUtils = new AesUtils();

        var userRecord = new GlideRecord('sys_user');

        if (userRecord.get(userSysId) || userRecord.get('user_name', userName))
            return aesUtils.getObjectFromGlideRecord(userRecord, ['sys_id', 'email', 'name']);
    }
    var aesControllerUtils = new AesControllerUtils();

    if (!aesControllerUtils.isCurrentInstanceController()) {
        throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage(gs.getMessage("This instance is not a controller. This api should be accessed only on the controller instance."));
    }

    var data = request.body.data;
    var templateSysId = data.template_sys_id;
    var templateName = data.template_name;
    var type = data.type;
    var originInstanceUrl = data.origin_instance_url;
    var users = data.users;

    if (!templateSysId || !templateName || !type || !originInstanceUrl || !users || !users.length) {
        throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage(gs.getMessage("template_sys_id, template_name, type, originInstanceUrl and users are required"));
    }
    var appTemplateConstants = new AppTemplateConstants();
    var emailEvents = appTemplateConstants.getEmailEvents();
    var allowedTypes = Object.keys(emailEvents);

    type = type.toUpperCase();

    if (allowedTypes.indexOf(type) < 0) {
        throw new sn_ws_err.ServiceError()
            .setStatus(400)
            .setMessage(gs.getMessage("type should be one of {0}", allowedTypes.join()));
    }

    var aesUtils = new AesUtils();
    var cleanedOriginInstanceUrl = aesUtils.removeTrailingSlash(originInstanceUrl);


    var emailEventFiredUserList = [];
    var unavailableUserList = [];

    users.forEach(function(user) {
        var userData = getUserData(user.sys_id, user.user_name);

        if (userData) {
            emailEventFiredUserList.push(user);
            //generate event
            var eventName = emailEvents[type];
            var eventParam1 = userData.email;
            var eventParam2 = data;

            eventParam2.user_full_name = userData.name;
            eventParam2.origin_instance_url = cleanedOriginInstanceUrl;
            eventParam2.currentUserPayloadData = user;

            delete eventParam2.users;

            gs.eventQueue(eventName, undefined, eventParam1, JSON.stringify(eventParam2));
        } else {
            unavailableUserList.push(user);
        }
    });

    var output = {
        emailEventFiredUserList: emailEventFiredUserList,
        unavailableUserList: unavailableUserList
    };

    response.setBody(output);
    response.setStatus(200);
})(request, response);
