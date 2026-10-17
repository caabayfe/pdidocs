var redirectUrl = "sys_push_notif_msg_content.do?sys_id=-1&sysparm_query=script=(function buildJSON(/*GlideRecord*/ current, /*String*/ message, /*Object*/ attributes) {%0A%0A  var layoutFields = {\"Identifier\" : \"number\", \"Description\" : \"short_description\", \"Status\" : \"state\" };%0A  return new global.ActionablePushPayloadBuilder(current, \"" + current.sys_id + "\", layoutFields).buildJSON(); %0A%0A})(current, message, attributes);";

action.setRedirectURL(redirectUrl);
