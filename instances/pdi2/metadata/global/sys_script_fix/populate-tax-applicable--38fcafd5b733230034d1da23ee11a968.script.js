(function() {
    var astContract = new GlideMultipleUpdate("ast_contract");
    astContract.addQuery("tax_exempt", "1");
	astContract.setValue("applicable_taxes", "exempt");
	astContract.execute();

	// Sales flag has priority
    astContract = new GlideMultipleUpdate("ast_contract");
	astContract.addQuery("sales_tax", "1");
	astContract.setValue("applicable_taxes", "sales");
	astContract.execute();
})();
