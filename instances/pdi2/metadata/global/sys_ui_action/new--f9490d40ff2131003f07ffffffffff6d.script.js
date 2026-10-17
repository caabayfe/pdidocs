var uri = action.getGlideURI();
var path = '';
uri.set('sys_id', '-1');

if (uri.get("sysparm_collection_relationship") == "6b04aaa10a0a0b9a00bd55d1e6f0782d") {
    path = uri.get("sysparm_collection") + '.do';

    if (!uri.get("sysparm_collection_key"))
        uri.set('sysparm_collection_key', 'parent');
} else {
    path = 'knowledge_create.do';
}

action.setRedirectURL(uri.toString(path));
action.setNoPop(true);
