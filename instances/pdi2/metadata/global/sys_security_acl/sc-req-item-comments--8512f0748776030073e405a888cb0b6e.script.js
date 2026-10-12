if (current.state == '3' || current.state == '4' || current.state == '7') {
	if (gs.getProperty('glide.sc.allow_comment_on_closed_ritm') == 'true')
		answer = true;
	else
		answer = false;
} else
	answer = true;
