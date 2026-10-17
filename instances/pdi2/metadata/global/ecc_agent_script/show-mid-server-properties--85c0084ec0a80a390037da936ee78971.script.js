var config = Packages.com.service_now.mid.services.Config.get();
var props = config.getProperties();
var prop_enum = props.propertyNames();
var prop_vals = [];
prop_vals.push('MID Server properties:\n');

while (prop_enum.hasMoreElements()) {
    var prop_name = '' + prop_enum.nextElement();
    if (prop_name.match(/password/i)) {
        prop_vals.push(prop_name + ': ********\n');
    } else {
        var prop_value = '' + props.getProperty(prop_name);
        prop_vals.push(prop_name + ': ' + prop_value + '\n');
    }
}

prop_vals.join('');
