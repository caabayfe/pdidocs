var name = "NetworkAdapter@";

if (!gs.nil(current.ip_address))
    name += current.ip_address;
else if (!gs.nil(current.mac_address))
    name += current.mac_address;
else
    name += "unknown";

current.name = name;
