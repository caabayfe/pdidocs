data.showPrices = $sp.showCatalogPrices();
data.limit = options.limit || 9;
data.useSmallIcons = options.use_small_icons || false;
data.catalogs = options.catalogs || [];
data.showNoDataMsg = options.show_no_data_message || true;
data.isServiceWorkspace = inServiceWorkspace() || false;
data.title = gs.getMessage("Popular Items");
var items = [];
var itemIds = [];

var popularItems = new GlideRecord("sc_popular_items");
var count = 0;
popularItems.addQuery("time_period", options.popular_items_created);
popularItems.orderByDesc("request_count");
if (data.catalogs.length != 0)
    popularItems.addQuery("sc_catalog", "IN", data.catalogs);

popularItems.query();
while (popularItems.next()) {
    if (itemIds.includes(popularItems.getValue("sc_cat_item")))
        continue;

    if (count >= data.limit)
        break;

    var item = new sn_sc.CatItem(popularItems.getValue("sc_cat_item"));
    if (!item.canView())
        continue;

    var itemDetails = item.getItemSummary();
    if (itemDetails.hide_sp && !data.isServiceWorkspace)
        continue;
    itemDetails.order = 0 - popularItems.getValue("request_count"); //To show the most popular item first
    itemDetails.hasPrice = itemDetails.price != 0;
    itemDetails.page = (itemDetails.type == "order_guide") ? "sc_cat_item_guide" : "sc_cat_item";
    count++;
    items.push(itemDetails);
    itemIds.push(itemDetails.sys_id);
}

data.items = items;

function isAttrTrue(value) {
    return value === true || value === 'true';
}

function inServiceWorkspace() {
    return isAttrTrue(options.isServiceWorkspace) && !isAttrTrue(options.legacy_catalog);
}
