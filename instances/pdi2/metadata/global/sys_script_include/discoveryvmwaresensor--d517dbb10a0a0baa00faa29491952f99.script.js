var DiscoveryVMWareSensor = Class.create();

DiscoveryVMWareSensor.prototype = Object.extendsObject(DiscoverySensor, {
    process: function(result) {
        this.parseResult(result);
    },

    parseResult: function(result) {
        var vmList;

        if (result.output)
            vmList = new XMLHelper(result.output).toObject();
        else
            vmList = result;

        if (!vmList)
            return;

        if (vmList.version_major)
            this.processVersion(vmList);

        var instances = g_array_util.ensureArray(vmList.instance);
        if (instances.length == 0)
            return;

        this.processInstances(this.parseVMNodes(instances));
    },

    processVersion: function(vmList) {
        var va = vmList.version_major;
        var vb = vmList.version_minor;
        var vc = vmList.version_revision;
        var vd = vmList.version_build;

        current.version = va.trim() + '.' + vb.trim() + '.' + vc.trim() + '.' + vd.trim();
    },

    processInstances: function(instances) {
        // vmWare here represents the CI of VMWare. It could be the ESX box or a VMWware application running on top of 
        // another OS
        var vmWare = this.getCmdbRecord();

        var images = this.updateVMWareImages(instances, vmWare);
        this.createLinkToVirtualServers(images, vmWare);

    },

    updateVMWareImages: function(instances, vmWare) {
        var processed = {};
        var imageArr = [];
        var vmgr = new GlideRecord('cmdb_ci_vm_instance');

        for (var id in instances) {
            var vmname = instances[id]['name'];
            var updatevm = false;

            vmgr.initialize();
            vmgr.addQuery('correlation_id', id);
            vmgr.query();
            if (vmgr.next())
                updatevm = true;

            vmgr.vm_name = vmname;
            vmgr.name = vmname;
            vmgr.image_path = instances[id]['vmx_path'];
            vmgr.state = instances[id]['state'];
            vmgr.template = instances[id]['template'];
            vmgr.correlation_id = id;

            var imageSysId;
            if (updatevm)
                imageSysId = vmgr.update(this.getSensorName());
            else
                imageSysId = vmgr.insert(this.getSensorName());

            //link Image To VM Host
            g_disco_functions.createRelationshipIfNotExists(imageSysId, vmWare, 'Registered on::Has registered');

            processed[vmgr.correlation_id] = 1;
            imageArr.push(imageSysId);
        }

        this.deleteVMImagesFromVMWare(vmWare, processed);

        return imageArr;
    },

    deleteVMImagesFromVMWare: function(vmWare, imageProcessed) {
        var gr = new GlideRecord("cmdb_rel_ci");
        gr.addQuery('child', vmWare);
        gr.addQuery('type', new DiscoveryFunctions().findCIRelationshipType('cmdb_rel_type', 
                'Registered on::Has registered'));
        gr.query();
        while (gr.next()) {
            if (imageProcessed[gr.parent.correlation_id])
                continue;

            var imageGr = new GlideRecord('cmdb_ci_vm_instance');
            if (imageGr.get(gr.parent.sys_id))
                imageGr.deleteRecord();
        }
    },

    createLinkToVirtualServers: function(images, vmWare) {
        var cgr = new GlideRecord('cmdb_ci_computer');
        var vmgr = new GlideRecord('cmdb_ci_vm_instance');

        for (var i = 0; i < images.length; i++) {
            vmgr.initialize();
            if (!images[i] || !vmgr.get('sys_id', images[i]))
                continue;

            if (vmgr.template) //Dont bother with linking templates
                continue;

            cgr.initialize();
            cgr.addQuery('serial_number', 'vmware-' + vmgr.correlation_id);
            cgr.query();
            if (!cgr.next())
                continue;

            // Link Virtual Servers to VM Ware
            g_disco_functions.createRelationshipIfNotExists(cgr, vmWare, 'Virtualized by::Virtualizes');
            // Link Virtual Servers to VM Image
            g_disco_functions.createRelationshipIfNotExists(cgr, vmgr, 'Instantiates::Instantiated by');
        }
    },

    /*
     *  Get the VMWare host (ESX box) this app is running on
     */
    parseVMNodes: function(vms) {
        var instances = {};

        for (var i = 0; i < vms.length; i++) {
            var template = false;
            var node = vms[i];
            var vmx_path = node.vmx_path;
            if (vmx_path.indexOf('.vmtx') > -1)
                template = true;

            var state = 'off';
            if (!template)
                 state = node.state.trim();

            var config = node['#cdata'];
            var configMap = this.parseVMFile(new String(config));
            var name = configMap['displayName'];
            var vm_id = configMap['uuid.bios'];

            instances[vm_id] = {};
            instances[vm_id]['name'] = name;
            instances[vm_id]['vmx_path'] = vmx_path;
            instances[vm_id]['state'] = state;
            if (template)
                instances[vm_id]['template'] = 'true';
        }

        return instances;
    },

    parseVMFile: function(str) {
        var map = {};
        var lines = str.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i].trim();
            var nameValue = line.split(/\s*=\s*/, 2);
            if (nameValue.length < 2)
                continue;

            if (nameValue[1].startsWith('"'))
                nameValue[1] = nameValue[1].substring(1, nameValue[1].length-1);

            var name = nameValue[0];
            var value = nameValue[1];
            map[name] = value;
        }

        return map;
    },

    type: "DiscoverySensor"
});
