var builder = new SNC.OAuthEntityBuilder(current);
var length = new GlideBoundedIntProperty("com.glide.oauth.client_secret.auto_generate_length", 32, 10, 4096).getInt();
builder.autoSetClientSecret(length);
builder.autoSetClientID();
if (current.operation() == 'insert')
	builder.resetScopeRestrictionStatusForUserAccount();
