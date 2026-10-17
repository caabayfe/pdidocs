function getFeedbackScore(feedback) {
    if (feedback == "Accepted") 
		return 0;
	else if (feedback == "LikelyNegative") 
		return 1;
	else if (feedback == "LikelyPositive") 
		return 2;
	else if (feedback == "Ignored") 
		return 3;
	else if (feedback == "Rejected") 
		return 4;
	else if (feedback == "Cancelled") 
		return 5;
	else if (feedback == "SlightlyNegative") 
		return 6;
	else if (feedback == "SlightlyPositive") 
		return 7;

    return null;
};

getFeedbackScore(current.feedback);
