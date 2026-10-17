if (cancelled == "false") {
	new Consumables().retireConsumable(consumable, qty, status, consumable_substatus, stockroom);
}
response.sendRedirect("alm_consumable.do?sys_id=" + consumable);
