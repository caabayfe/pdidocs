			var counter = new GlideRecord('sys_number_counter');
			counter.query('table', current.category);
			
			// Don't create a sys_number_counter record if we are using sequences
			if (!counter.next() && new NumberManager(current.category).usingCounterTable()) {
				// If not found, create on the fly.
				counter.initialize();
				counter.table = current.category;
				counter.number = current.number;
				counter.insert();
			}

			action.setRedirectURL(counter);
			
