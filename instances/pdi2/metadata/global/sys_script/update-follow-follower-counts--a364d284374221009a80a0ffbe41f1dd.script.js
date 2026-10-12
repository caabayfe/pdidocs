if(current.operation() === 'insert') {
	new LiveFeedNetwork().processFollowEvent(current);
}
else if(current.operation() === 'delete') {
	new LiveFeedNetwork().processUnFollowEvent(current);
}
