(function(context, pageParams){  /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */

    var collabSettingDto = sn_collab.CollabChatScriptObject.getCollabChatSettingForCurrentDomain();
    if (collabSettingDto) {
        context.props_details.record = collabSettingDto.sysId;
    }
})(context, pageParams);
