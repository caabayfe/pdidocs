var t = current.internal_type;
		if (t == 'reference' || t == 'glide_list' || t == 'domain_id') {
			current.reference.setError("Cannot set a reference type field (e.g., reference, glide_list, domain_id) without a referenced table");
			gs.log('update of ' + current.name + '.' + current.element + ' canceled because reference value not set');
			current.setAbortAction(true);
		}
