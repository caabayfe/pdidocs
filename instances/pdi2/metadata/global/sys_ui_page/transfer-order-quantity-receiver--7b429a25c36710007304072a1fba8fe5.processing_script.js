if (cancelled == "false") {
   gs.include('TransferOrderReceiver');
   var received = parseInt(quantity_received, 10);
   var tor = new TransferOrderReceiver();
   tor.receiveAssets(transfer_order_line, received);
   response.sendRedirect("alm_transfer_order.do?sys_id=" + transfer_order);
}
