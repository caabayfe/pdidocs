(function process(env) {
   return 'errorType' in env.getObject() ? 'Error' : 'Templates';
})(env);
