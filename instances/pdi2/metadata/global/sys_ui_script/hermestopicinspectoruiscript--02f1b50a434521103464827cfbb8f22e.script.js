var HermesTopicInspectorUIScript = Class.create();

HermesTopicInspectorUIScript.prototype = {
    NA: getMessage("NA"),

    initialize: function() {},

    invalidServerResponsePopUp: function() {
        var gm = new GlideModal('glide_info');
        gm.setTitle(getMessage("Received an invalid response from the server"));
        gm.on('closeconfirm', function() {
            GlideModal.prototype.get('hermes_consumer_viewer').destroy();
        });
        gm.render();
    },

    valueOrNA: function(value) {
        return value ? value : this.NA;
    },

    offsetValueOrNA: function(value) {
        return ((value || value == 0) && value > -1) ? value : this.NA;
    },

    getResponseElements: function(response, tagName) {
        if (!response)
            return;

        var responseXML = response.responseXML;
        if (!response.responseXML)
            return;

        var documentElement = responseXML.documentElement;
        if (!documentElement)
            return;

        var elements = documentElement.getElementsByTagName(tagName);
        if (!elements)
            return;

        return elements;
    },

    groupAndSortPartitions: function(partitionInfoList, nearDC) {
        var partitionInfoArr = [].slice.call(partitionInfoList);
        dcGroupedPartitions = partitionInfoArr.reduce(function(accum, elem) {
            (accum[elem.getAttribute("dc")] = accum[elem.getAttribute("dc")] || []).push(elem);
            return accum;
        }, {});
        var dcs = Object.keys(dcGroupedPartitions);
        dcs.sort(function(a, b) { // Sort so all partitions from the near side are shown first 
            if (a == nearDC)
                return 1;
            else if (b == nearDC)
                return -1;

            return 0;
        });
        var result = [];
        for (var i = 0; i < dcs.length; i++) {
            var dcPartitionInfo = dcGroupedPartitions[dcs[i]];
            if (!dcPartitionInfo)
                continue;

            dcPartitionInfo.sort(function(a, b) { // Sort by partition number
                return b.getAttribute("value") - a.getAttribute("value");
            });
            result.push(dcPartitionInfo);
        }
        return result.flatMap(function(partitionInfo) {
            return partitionInfo;
        });
    }

};
