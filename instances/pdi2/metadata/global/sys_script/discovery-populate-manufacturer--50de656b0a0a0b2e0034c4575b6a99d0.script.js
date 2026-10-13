var mac = SncMACAddress.getMACAddressInstance(current.mac_address);

if (mac != null) {
    var macMfr = SncMACAddressMfr.getManufacturer(mac);

    if (macMfr != null) {
        var cr = new GlideCompanyResolver();
        cr.addProposedName(macMfr);
        var mmid = cr.matchOrCreateCompanyName();
        current.mac_manufacturer = mmid;
    }
}
