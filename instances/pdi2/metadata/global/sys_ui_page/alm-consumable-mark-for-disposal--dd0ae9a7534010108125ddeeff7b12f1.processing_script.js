var redirectId = consumable;
if (cancelled == "false") {
	redirectId = new global.Consumables().markReadyForDisposal(consumable, qty, status, substatus);
}
response.sendRedirect("alm_consumable.do?sys_id=" + redirectId);
