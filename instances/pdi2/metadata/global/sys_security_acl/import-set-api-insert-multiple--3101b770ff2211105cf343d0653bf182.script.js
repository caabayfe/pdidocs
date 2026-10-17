answer = !GlideProperties.getBoolean('com.glide.import_set_api.insert_multiple_optimize', false) || GlideSession.get().getUser().hasRole('import_transformer');
