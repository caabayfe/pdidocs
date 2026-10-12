var label = new GlideRecord('label');
    if (label.get(current.label))
        (new LabelCollision()).renameCollidingPrivateLabelsForUser(label, current.user);
