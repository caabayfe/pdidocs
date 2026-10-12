var propGr = new GlideRecord('sys_properties');
propGr.addQuery('name', 'glide.sg.offline.expiration');
propGr.query();

if (propGr.next()) {
    var valueInMS = propGr.getValue('value');
    var valueInS = Math.round(parseInt(valueInMS) / 1000);
    if (Number.isInteger(valueInS)) {
        gs.info('Update glide.sg.offline.expiration value from ' + valueInMS + ' to ' + valueInS);
        propGr.setValue('value', valueInS+'');
        propGr.setValue('description', 'Offline expiration unit is changed to second in Zurich');
        propGr.update();
    } else
        gs.info('Skip updating glide.sg.offline.expiration from ' + valueInMS + ' to ' + valueInS);
} else  
    gs.info('No update, property glide.sg.offline.expiration is not customized');
