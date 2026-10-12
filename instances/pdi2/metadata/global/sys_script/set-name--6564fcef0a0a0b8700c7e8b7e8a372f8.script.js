if (!current.configuration_item.nil()) {
   current.name = current.notification.getDisplayValue() + ' (' + current.configuration_item.getDisplayValue() + ')';
} else if (!current.location.nil()) {
   current.name = current.notification.getDisplayValue() + ' (' + current.location.getDisplayValue() + ')';
} else if (!current.cost_center.nil()) {
   current.name = current.notification.getDisplayValue() + ' (' + current.cost_center.getDisplayValue() + ')';
} else {
   current.name = current.notification.getDisplayValue();
}
