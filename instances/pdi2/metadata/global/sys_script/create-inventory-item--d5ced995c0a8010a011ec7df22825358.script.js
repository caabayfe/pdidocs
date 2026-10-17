doCreation();



function logStuff() {
    var pat = current.variable_pool.create_item;
    gs.print("CREATE ITEM= " + pat);
    gs.print("ASSET TAG = " + current.variable_pool.asset_tag);
    gs.print("SERIAL NUMBER = " + current.variable_pool.serial_number);
    gs.print("COMPANY = " + current.variable_pool.company);
    gs.print("COMPANY NAME = " + current.variable_pool.company.getDisplayValue());
    gs.print("NAME = " + current.variable_pool.name);
    gs.print("OS = " + current.variable_pool.os);
    gs.print("MEMORY = " + current.variable_pool.memory);
    gs.print("HARD DRIVE = " + current.variable_pool.hard_drive);
    gs.print("CPU SPEED = " + current.variable_pool.cpu_speed);
}

function doCreation() {
    var create = current.variable_pool.create_item;
    if (create == 'true') {
        // we want to create an asset
        var computer = new GlideRecord('cmdb_ci_computer');
        computer.initialize();
        computer.asset_tag = current.variable_pool.asset_tag;
        computer.serial_number = current.variable_pool.serial_number;
        computer.name = current.variable_pool.name;
        computer.manufacturer = current.variable_pool.company;
        computer.os = current.variable_pool.os;
        computer.ram = current.variable_pool.memory;
        computer.disk_space = current.variable_pool.hard_drive;
        computer.cpu_speed = current.variable_pool.cpu_speed;
        computer.assigned_to = current.request.requested_for;
        computer.insert();
        gs.addInfoMessage(gs.getMessage("Created CMDB Computer with name = {0}", computer.name));
    }
}
