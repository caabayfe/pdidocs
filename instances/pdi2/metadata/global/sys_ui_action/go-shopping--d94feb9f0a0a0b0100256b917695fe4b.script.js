var url = "catalog_home.do?sysparm_view=catalog_default&sysparm_processing_hint=setfield:request.parent="
url += current.sys_id;

action.setRedirectURL(url);
