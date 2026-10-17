function evaluate({api}) {

  if (api.context.props.payload && api.context.props.payload.children) {
    return false;
  } else {
      return true;
  }

}
