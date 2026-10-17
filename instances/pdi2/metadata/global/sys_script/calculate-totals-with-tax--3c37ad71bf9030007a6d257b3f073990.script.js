var totalCosts = new ExpenseManagementUtils().getTaxAmount(current.sales_tax, current.payment_amount.getCurrencyString().replace('.', GlideLocale.get().getDecimalSeparator()), current.tax_rate);

current.tax_rate = totalCosts.taxRate;
current.tax_cost = totalCosts.currency + ";" + totalCosts.taxCost;
current.total_cost = totalCosts.currency + ";" + totalCosts.amount;
