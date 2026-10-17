function handler({ api, event, imports }) {
  var likeCommentPayload = {
    operation: {
      dataElementId: "like_knowledge_comment",
      operationName: "EXECUTE"
    },
    operationPayload: {
      commentId: event.payload.commentId,
      articleId: api.context.props.sysId
    }
  }

  var unlikeCommentPayload = {
    operation: {
      dataElementId: "unlike_knowledge_comment",
      operationName: "EXECUTE"
    },
    operationPayload: {
      commentId: event.payload.commentId,
      articleId: api.context.props.sysId
    }
  }

  if (event.payload.reaction) {
    api.emit("UXF_DB_OP_TRIGGER_REQUESTED", likeCommentPayload);
  } else {
    api.emit("UXF_DB_OP_TRIGGER_REQUESTED", unlikeCommentPayload);
  }
}
