var url = "item_option_new_producer_set.do?sys_id=-1&sysparm_query=type=one_to_one";
url += "&sysparm_link_collection=io_set_item";
url += "&sysparm_collection_key=sc_cat_item";
url += "&sysparm_collectionID=" + current.getUniqueValue();
url += "&sysparm_collection_related_field=variable_set";
action.setRedirectURL(url);
