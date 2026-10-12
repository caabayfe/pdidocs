(function(params) {
    var table = params.data.table;
    if (table === 'alm_hardware' || table === 'alm_asset' || table === 'alm_consumable' || table === 'alm_facility') {
        return true;
    } else {
        return false;
    }

    
})(inputProperties);
