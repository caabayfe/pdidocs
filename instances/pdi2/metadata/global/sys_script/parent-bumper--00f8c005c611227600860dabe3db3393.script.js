var parent = new GlideRecord('sc_cat_item_delivery_task');
var gotten = parent.get(current.dt_parent);

if (gotten == true)
  parent.update();
