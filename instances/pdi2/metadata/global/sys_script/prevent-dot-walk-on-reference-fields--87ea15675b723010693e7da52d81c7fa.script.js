current.attributes = removeDotWalk(current.attributes);
current.null_update = removeDotWalk(current.null_update);

function removeDotWalk(list) {
    var attrs = list.split(',');
    var left = [];
    for (var i in attrs)
        if (attrs[i].indexOf('.') == -1)
            left.push(attrs[i]);
    return left.join(',');
}

gs.addInfoMessage(gs.getMessage("Dot-walking attributes not supported for reference fields!"));
