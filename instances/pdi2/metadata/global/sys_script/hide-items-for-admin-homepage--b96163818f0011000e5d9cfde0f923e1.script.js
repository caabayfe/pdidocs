(function() {
    var transaction = GlideTransaction.get();
    if (!transaction)
        return;

    var page = transaction.getPageName();

    if (!page || (page.indexOf("sc_cat_item") == -1 &&
            page.indexOf('sys_report_template') == -1 /*Remove admin item from reports as well */ &&
            page.indexOf('globalsearch') == -1 &&
            page.indexOf('textsearch') == -1) &&
        page.indexOf('xmlhttp') &&
        page.indexOf('catalog_find') &&  /*Remove admin items from globalsearch as well */
        page.indexOf('angular') &&
        page.indexOf('api/now/') &&
        page.indexOf('com.glideapp.servicecatalog_cat_item_view') &&  /*Remove admin items from lookup as well */
        page.indexOf('report_viewer'))
        return;

    current.addNullQuery('sc_catalogs').addOrCondition("sc_catalogs", "DOES NOT CONTAIN", "0b22fd2ad7021100b9a5c7400e610319");
})();
