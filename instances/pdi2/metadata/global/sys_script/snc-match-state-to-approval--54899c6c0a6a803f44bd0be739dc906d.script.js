// Make the state match the approval value
if (current.approval.changesTo('not requested'))
	current.state = '-5'; // Pending

else if (current.approval.changesTo('requested'))
	current.state = '1'; // Open

else if (current.approval.changesTo('approved') || current.approval.changesTo('rejected'))
	current.state = '3'; // Closed Complete

else if (current.approval.changesTo('cancelled'))
	current.state = '4'; // Closed Incomplete

else if (current.approval.changesTo('not_required'))
	current.state = '7'; // Closed Skipped
