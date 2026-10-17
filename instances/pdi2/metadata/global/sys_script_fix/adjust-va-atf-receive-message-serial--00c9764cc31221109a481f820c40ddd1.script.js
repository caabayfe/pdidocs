new global.GlideQuery('sys_atf_step')
    .where('step_config', 'b55a25624d220110fa9b4c739da9ee81') //Receive Message
    .groupBy('test')
    .aggregate('count')
    .select()
    .forEach(function(group) {
        var test = group.group.test;
        var stepGr = new GlideRecord('sys_atf_step');
        stepGr.addQuery('test', test);
        stepGr.addQuery('step_config', 'b55a25624d220110fa9b4c739da9ee81'); //Receive Message
        stepGr.orderBy('order');
        stepGr.query();
        var serial = 1;
        while (stepGr.next()) {
            var serialGlideElement = stepGr.inputs["serial_number"];
            var oldSerial = serialGlideElement.getValue();
            var newSerial = serial.toString();
            if (oldSerial != newSerial) {
                serialGlideElement.setValue(newSerial);
                serialGlideElement.setValueMapping(newSerial);
                stepGr.update();
                gs.log('Modify ATF VA Receive Message Serial. ATF step id:' + stepGr.getUniqueValue() + ', ' + oldSerial + '->' + newSerial);
            }
            serial++;
        }
    });
