new ProbePostProcessor({

    process: function() {
        var lines = output.split(/\n/);

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var parts = line.split('=');
            if (parts[0] == 'Serial')
                current.serial_number = parts[1];
            }
        },

    type: "ProbePostProcessor"
});
