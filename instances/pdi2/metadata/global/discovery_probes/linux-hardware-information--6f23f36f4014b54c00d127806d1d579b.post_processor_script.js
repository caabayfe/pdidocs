new ProbePostProcessor({

	/**
	 * Runs the probe instance
	 */
	process : function() {
		if (!(g_probe.haveWarning() || g_probe.haveError()) && !output.contains("System Information")) {
			g_probe.setError("Unable to parse output of dmidecode: " + output);
			related_data.warn = "Unable to parse output of dmidecode: " + output;
			return;
		}

		related_data.tDataObj = {};

		// key (property name) is currentBlock + ':' + field name...
		var matchMap = {
			'1:Manufacturer'  : 'manufacturer',
			'1:Product Name'  : 'model_id',
			'1:Version'       : 'model_number',
			'1:Serial Number' : 'system_serial_number',
			'1:UUID'          : 'uuid_serial',
			'2:Serial Number' : 'baseboard_serial',
			'3:Serial Number' : 'chassis_serial'
		};
		var handleRegex = /.*DMI type ([0-9]+).*/;
		var valueRegex = /^\s*([^:]*)\s*:\s*(.*?)\s*$/;
		var currentBlock = -1;

		/**
		 *  Output for dmidecode will be in this format:
		 *    Handle 0x0107, DMI type 3, 6 bytes
		 *    Serial Number: VMware-42 08 4b d3 41 9e eb e3-5e fd 7e 7b 42 42 c0 66;
		 *    UUID: 42084BD3-419E-EBE3-5EFD-7E7B4242C066
		 *
		 *    Handle 0x0105, DMI type 23, 13 bytes
		 *    ...
		 *
		 *  The following code splits the output into blocks (around "Handle 0x").
		 *  A bit of optimization is done based on the fact that we only care about
		 *  DMI types between 1~3.
		 *  Skip processing on blocks with types that are not in this range.
		 *  If the type is between 1~3, we grab the field names that we care about and
		 *  save those in tDataObj.
		 */
		var blocks = output.split(/Handle\s0x/);
		for(var i = 0; i < blocks.length; i++) {
			var block = blocks[i];
			var mat = handleRegex.exec(block);
			if (mat) {
				currentBlock = parseInt(mat[1]);
				// we're only interested in blocks 1 through 3...
				if (currentBlock < 1 || currentBlock > 3)
					continue;
			}

			var values = block.split(/\n/);
			for (var j = 0; j < values.length; j++) {
				var value = values[j].trim();
				mat = value.match(valueRegex);
				if (!mat)
					continue;

				var fieldName = mat[1];
				var fieldValue = mat[2];
				var curName = matchMap['' + currentBlock + ':' + fieldName];
				if (curName == null)
					continue;

				// don't overwrite data we already have, as sometimes there are duplicate blocks with no data...
				if (related_data.tDataObj[curName] == null)
					related_data.tDataObj[curName] = fieldValue;
			}
		}
	}
});
