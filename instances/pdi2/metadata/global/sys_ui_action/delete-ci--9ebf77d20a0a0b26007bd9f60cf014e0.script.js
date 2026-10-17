    try {
        new DiscoveryFunctions().deleteCI(current, true);
    } catch (e) {
        current.deleteRecord();
    }
