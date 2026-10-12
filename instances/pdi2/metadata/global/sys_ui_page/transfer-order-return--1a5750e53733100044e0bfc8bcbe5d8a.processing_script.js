if ('false' == cancelled)
  returnItemsFromTOLandRedirect();

function returnItemsFromTOLandRedirect() {
  var isDefective = false;
  if (typeof defective != 'undefined' && 'on' == defective)
    isDefective = true;

  gs.include('TransferOrderReturn');
  var rto = new TransferOrderReturn();
  var tol = new GlideRecord('alm_transfer_order_line');
  tol.get(tol_sys_id);
  var rtol = rto.returnItemsFromTransferOrderLine(tol, return_quantity_requested, return_reason, isDefective);

  var tolUrl = tol.getRecordClassName() + ".do?sys_id=" + tol_sys_id;
  response.setReturnURL(tolUrl);

  var rtolUrl = rtol.getRecordClassName() + ".do?sys_id=" + rtol.sys_id;
  response.sendRedirect(rtolUrl);

  gs.addInfoMessage(gs.getMessage('Created return transfer order line'));
}
