checkRedirect();

function checkRedirect() {
		producer.redirect = "catalog_home.do?sysparm_view=catalog_default";
		gs.addInfoMessage(
			gs.getMessage("Your request for a new knowledge base has been received - once the request is approved, you will be notified by email")
		);
}
