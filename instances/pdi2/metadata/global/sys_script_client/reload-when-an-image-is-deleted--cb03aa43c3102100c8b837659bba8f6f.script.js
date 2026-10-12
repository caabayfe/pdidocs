function onLoad() {
	var imageControls = ["edit.sc_ic_item_staging.desktop_image", "edit.sc_ic_item_staging.mobile_image"];
	for (var i = 0; i < imageControls.length; i++) {
		var imageControl = $(imageControls[i]);
		if (imageControl && imageControl.select)
			imageControl.select(".attachment").each(function(elem) {
				if (elem.up().id.endsWith("_delete")) {
					elem.on("click", function() {
						if (g_form.getValue("state") == "published") {
							GlideUI.get().clearOutputMessages();
							g_form.setValue("state", "draft");
							g_form.addInfoMessage(getMessage("Your item has been set back to Draft from Published state"));
							var publish = $("sc_ic_publish");
							if (publish)
								publish.show();
							var unpublish = $("sc_ic_unpublish");
							if (unpublish)
								unpublish.hide();
						}
					});
				}
			});
	}
}
