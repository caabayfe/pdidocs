function getConvType(type) {
    try {
        switch (type) {
            case 'VA Only':
                return 50;
            case 'LA Only':
                return 150;
            case 'VA to LA':
                return 250;
            case 'Never Engaged':
                return 350;
            default:
                return null;
        }
    } catch (e) {
        return null;
    }
}
getConvType(current.type + '');
