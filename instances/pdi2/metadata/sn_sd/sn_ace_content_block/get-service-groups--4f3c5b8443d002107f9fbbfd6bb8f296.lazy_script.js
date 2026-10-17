(function(context, pageParams, blockcontext) {
    var arrServiceGroup = [];
    var uniqueServiceGroup = [];
    var grM2m = new GlideRecord("sn_sd_tab_m2m_dashboard");
    grM2m.query();

    while (grM2m.next()) {
        var tmpArrServiceGroup = grM2m.service_group.split(",");

        for (var i = 0; i < tmpArrServiceGroup.length; i++) {
            var grServiceGroup = new GlideRecord("sn_sd_service_group");

            if (grServiceGroup.get(tmpArrServiceGroup[i])) {
                arrServiceGroup.push({
                    id: grServiceGroup.sys_id.toString(),
                    label: grServiceGroup.getDisplayValue("name")
                });
            }
        }
    }

    var uniqueObject = {};
    for (i in arrServiceGroup) {

        objTitle = arrServiceGroup[i]['label'];
        uniqueObject[objTitle] = arrServiceGroup[i];
    }

    for (i in uniqueObject) {
        uniqueServiceGroup.push(uniqueObject[i]);
    }

    uniqueServiceGroup.sort(function(a, b) {
        if (a.label < b.label) {
            return 1;
        }
        if (a.label > b.label) {
            return -1;
        }
        return 0;
    });

    return uniqueServiceGroup;
})(context, pageParams, blockcontext);
