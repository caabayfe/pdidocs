// Encrypt an entry from sys_properties that has a type password or password2
current.value = GlidePropertiesDB.encryptValue(current.value);
