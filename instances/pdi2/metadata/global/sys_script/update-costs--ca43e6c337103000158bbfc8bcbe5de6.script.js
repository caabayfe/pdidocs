var prev_qty = previous.quantity;
var prev_cost = previous.cost.getCurrencyValue();
var prev_cost_currencycode = previous.cost.getCurrencyCode();
var newCost = (prev_cost/prev_qty) * current.quantity;
current.setValue('cost', prev_cost_currencycode+';'+newCost)
