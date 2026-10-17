generateHiLo();

function generateHiLo() {
    var net = SncIPNetworkV4.getIPNetworkInstance(current.dest_ip_network);
    if (!net)
        return;

    var lo = net.getAddress().getAddressAsLong();
    var hi = net.getBroadcastAddress().getAddressAsLong();
    current.lo_ip = lo;
    current.hi_ip = hi;
}
