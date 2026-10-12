// create a standalone asset record (its associated CI will come along as needed)
var asset = new GlideRecord(current.sys_class_name);
asset.model_category = current.model_category;
asset.model = current.model;
asset.stockroom = current.stockroom;
asset.location = current.location;
asset.managed_by = current.managed_by;
asset.cost = current.cost;
if (current.parent.nil()) {
   asset.install_status = current.install_status;
   asset.substatus = 'available';
} else {
   // inherit parent's state upon allocation and set parent
   asset.install_status = current.parent.install_status;
   asset.substatus = current.parent.substatus;
   asset.parent = current.parent;
}
asset.insert();

// decrement pre-allocated quantity
current.quantity = current.quantity - 1;
current.update();

// feedback and navigation
gs.addInfoMessage(gs.getEscapedMessage("Standalone asset got instantiated out of pre-allocated asset {0}", current.display_name));
action.setRedirectURL(asset);
action.setReturnURL(current);
