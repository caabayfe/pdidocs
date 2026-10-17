function handler({api, event, imports}) {
	api.setState('currentCommentId', event.payload.commentId);
}
