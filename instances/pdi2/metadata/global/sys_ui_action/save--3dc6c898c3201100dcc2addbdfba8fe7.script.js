current.insert();
			gs.include('ActionUtils');
			var au = new ActionUtils();
			au.postInsert(current);

			// For tables, we need to move this after everything above because there are cases where the sys_id at the outset is not the same as the sys_id at the end.
action.setRedirectURL(current);
