
            
            updateRolesForDependentProperties();
            function updateRolesForDependentProperties()
            {
                gs.info("Starting FixKMFStuff for highsecurity");
                GlideFixStuff.reloadKMFFilesForPlugin("com.glide.high_security", "com.glide.kmf");
                GlideFixStuff.reloadKMFFilesForPlugin("com.glide.high_security", "com.glide.kmf.global");
                GlideFixStuff.reloadKMFFilesForPlugin("com.glide.high_security", "com.sn_appauthor");
                GlideFixStuff.reloadKMFFilesForPlugin("com.glide.high_security", "com.sn_appclient");
            }
