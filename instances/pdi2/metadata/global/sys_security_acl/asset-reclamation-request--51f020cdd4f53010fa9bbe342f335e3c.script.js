answer = current.getValue('opened_by') === gs.getUserID() || gs.hasRole('inventory_user') || current.getValue('requested_for') === gs.getUserID();
