function handler({api}) {
	api.emit("NAV_ITEM_SELECTED", {route:"home", title: "Service Catalog Builder", redirect:true, reload:true});
}
