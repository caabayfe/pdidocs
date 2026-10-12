function onAfter(current, previous) {
	(new LabelCollision()).renameCollidingPrivateLabelsForUser(current, current.owner);
}
