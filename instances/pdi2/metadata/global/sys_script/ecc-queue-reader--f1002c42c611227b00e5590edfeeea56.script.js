processPayload()
markProcessed();

function processPayload() {
    var payload = current.payload + '';
    if (payload == "<see_attachment/>") {
        var sa = new GlideSysAttachment();
        payload = sa.get(current, 'payload');
    }

    var doc = new GlideXMLUtil().parse(payload);
    if (doc == null) {
        gs.print("ECC queue async reader - Invalid XML payload sys_id: " + current.sys_id);
        return;
    }

    var eccName = current.name + '';
    var names = eccName.split(".");
    var baseName = names[0];
    gs.print("Processing " + eccName + " from " + current.source);

    if (baseName == "wmi") {
        var wmildr =  new GlideappWMILoader();
        wmildr.load(doc, current);
    } else if (baseName == "adsi") {
        var asdildr =  new GlideappADSILoader();
        asdildr.load(doc, current);
    }
}

function markProcessed() {
    current.processed = gs.nowDateTime();
    current.update();
}
