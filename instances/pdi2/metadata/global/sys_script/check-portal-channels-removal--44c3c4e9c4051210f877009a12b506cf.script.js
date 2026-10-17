(function executeRule(current, previous /*null when async*/) {
    function parseChannels(value) {
        try {
            return value ? JSON.parse(value) : {};
        } catch (error) {
            return {};
        }
    }

    var currentChannels = parseChannels(current.value);
    var previousChannels = parseChannels(previous.value);

    var removedChannels = Object.keys(previousChannels).filter(function(channel) {
        return !currentChannels.hasOwnProperty(channel);
    });

    // If there are removed channels, check if they are still in use in the sp_portal table

    if (removedChannels.length > 0) {
        var portalRecord = new GlideRecord('sp_portal');
        portalRecord.addQuery('communication_channels', 'IN', removedChannels.join(','));
        portalRecord.query();

        var portalsWithRemovedChannels = [];
        while (portalRecord.next()) {
            var communicationChannels = portalRecord.communication_channels.split(',');
            var portalChannelsNotInSysProperty = communicationChannels.filter(function(channel) {
                return removedChannels.includes(channel);
            });

            if (portalChannelsNotInSysProperty.length > 0) {
                var portalSuffix = portalRecord.url_suffix.toString();

                if (portalsWithRemovedChannels.indexOf(portalSuffix) === -1)
                    portalsWithRemovedChannels.push(portalSuffix);
            }
        }

        if (portalsWithRemovedChannels.length > 0) {
            var portalsMessage = portalsWithRemovedChannels.join(', ');
            gs.addInfoMessage(gs.getMessage("The removed channels are being used in the following portals: {0}. Please visit and refresh the portal configuration page to apply the new values.", portalsMessage));
        }
    }
})(current, previous);
