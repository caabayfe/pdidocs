(function() {
        var propertyIds = [
            "0ad71e90c32130107a9240c1d840dd2f",
            "4791e062c32130107a9240c1d840dd24",
            "5d9559e0c32130107a9240c1d840ddea",
            "60269e50c32130107a9240c1d840dd34",
            "9a9856d0c32130107a9240c1d840dd80",
            "be5327d2c31230107a9240c1d840dded",
            "e1a5513fc33230107a9240c1d840dd55",
            "326e3414435d02103ca9a661c9b8f23d",
            "0c0e36a8c61122760094b0caafe5f56e",
            "9117b440c0a8020700ace6152ace7942",
            "529f697d0a0a0b340065009d1473b094",
            "856303e90a0a0bc50164129959388444",
            "0f97a9759773100031af390ddd297584",
            "148225759773100031af390ddd29753c",
            "ca95e5759773100031af390ddd2975c1",
            "58460547c0a80a6b0004648be1cf5c4a",
            "0c0a2c8dc61122760122be0bdab6e90c",
            "4e62a3050a32c15e0050ed0258eecf3d",
            "656cbd7eeb410100469a20425206fe09",
            "7b6b1489c61122780165cbd2742c0420",
            "e5c9157aeb410100469a20425206fe23",
            "ea59d17aeb410100469a20425206fe24"
        ];

        var rolesToAdd = "email_account_admin,admin";

        var pr = new GlideRecord("sys_properties");
        pr.addQuery("sys_id", "IN", propertyIds.join(","));
        pr.query();
        while (pr.next()) {
            try {
                var updateNeeded = false;

                if (gs.nil(pr.getValue("read_roles"))) {
                    pr.setValue("read_roles" , rolesToAdd);
                    updateNeeded = true;
                }

                if (gs.nil(pr.getValue("write_roles")) && pr.getUniqueValue() != '326e3414435d02103ca9a661c9b8f23d') {
                    pr.setValue("write_roles" , rolesToAdd);
                    updateNeeded = true;
                }

                if (updateNeeded)
                    pr.update();


            } catch (err) {

            }
        }
})();
