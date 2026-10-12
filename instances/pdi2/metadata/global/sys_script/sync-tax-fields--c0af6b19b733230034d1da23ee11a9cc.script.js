(function executeRule(current, previous /*null when async*/) {
	if (current.applicable_taxes.changes()) {  // New field takes priority
		var taxApplicable = current.applicable_taxes.getValue() + "";
		if (taxApplicable === "sales") {
			current.setValue("sales_tax", true);
			current.setValue("tax_exempt", false);
		} else if (taxApplicable === "exempt") {
			current.setValue("sales_tax", false);
			current.setValue("tax_exempt", true);
		} else {
			current.setValue("sales_tax", false);
			current.setValue("tax_exempt", false);
		}
		return;
	}
	// At this point one of the booleans have changed
	var salesTax = (current.getValue("sales_tax") +"" === "1");
	var taxExempt = (current.getValue("tax_exempt")+"" === "1");
	if (salesTax)
		current.setValue("applicable_taxes", "sales");
	else if (taxExempt)
		current.setValue("applicable_taxes", "exempt");
	else
		current.setValue("applicable_taxes", "");
})(current, previous);
