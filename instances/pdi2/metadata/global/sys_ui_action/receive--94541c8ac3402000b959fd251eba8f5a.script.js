// This version of Receive works for receiving assets and 1 consumable
gs.include('TransferOrderReceiver');
new TransferOrderReceiver().receiveAssets(current.sys_id, current.quantity_remaining);
