var name = current.service_offering.name == "" ? current.cmdb_ci.name : current.service_offering.name;
current.display_name = name + ' - ' + current.service_commitment.name;
