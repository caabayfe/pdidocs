//The ID sensor is an implementation of the multi sensor. In the related list "Responds to Probes", the script will be processed first.
new DiscoveryIDSensor({
     //Do not set os_version from Unix - Classify
     //os_version will be set from "AIX - OS Release" sensor
     prepare: function() {
        var data = this.ciData.getData();
        delete data.os_version;
    },

     //
    // this sensor uses the common script include class "DiscoveryIDSensor"
    //
    type: "AIX Identity"
});
