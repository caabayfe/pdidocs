//Update saves incidents before going to the catalog homepage
current.update();
var url;
var activeCatalogsCount = sn_sc.Catalog.getCatalogCount();
if (activeCatalogsCount === 1) {
    url = "catalog_home.do?sysparm_view=catalog_default&sysparm_parent_table=" + current.sys_class_name + "&sysparm_parent_sys_id=" + current.sys_id;
}
else {
    url = "catalogs_home.do?sysparm_view=catalogs_default&sysparm_parent_table=" + current.sys_class_name + "&sysparm_parent_sys_id=" + current.sys_id;
}


action.setRedirectURL(url);
