var blockId = current.sys_id;
var appConfig = current.document_id;
var url = "now/ace-app-builder/editor/params/blockid/" + blockId + "/aceconfig/" + appConfig;
action.setRedirectURL(url);
