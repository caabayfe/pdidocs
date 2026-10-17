var MIDSystemPropertyChange = Class.create();

MIDSystemPropertyChange.PRIORITY = 'Interactive';
MIDSystemPropertyChange.ECC_PARAMS = {
    'source': 'glide_property_updated',
    'topic': 'SystemCommand'
};

MIDSystemPropertyChange.prototype = {

    /*
     * Broadcast system property changes to all MID servers.
     * If property is deleted, value broadcasted is empty.
     */
    broadcast: function(current) {
        var value = current.value;
        if (current.operation() == 'delete')
            value = '';
        var probePayload = {
            'sys.property.name': current.name,
            'sys.property.value': value,
            'db.operation': current.operation()
        };
        new SNC.MidEccSender().broadcastToAllMidServers(MIDSystemPropertyChange.PRIORITY, MIDSystemPropertyChange.ECC_PARAMS, probePayload);
    },

    type: 'MIDSystemPropertyChange'
};
