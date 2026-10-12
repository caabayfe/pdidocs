
			function getNextObjNumberPadded() {
				var assignOnInsert = gs.getProperty("glide.itil.assign.number.on.insert");
				if (assignOnInsert == 'true') {
					if (current.sys_id.isNil())
						return null;
				}

				var nm = new NumberManager(current.sys_meta.name);
				return nm.getNextObjNumberPadded();
			}

			function padObjNumber(number, digits) {
				var nm = new NumberManager();
				return nm.padObjNumber(number, digits);
			}
			
