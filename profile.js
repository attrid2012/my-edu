(async function () {

    try {

        const user =
            await requireUser();

        if (!user) return;


        const profile =
            await getProfile(
                user.id
            );


        document
            .getElementById(
                "profileName"
            )
            .textContent =
            profile.full_name ||
            "Student";


        document
            .getElementById(
                "profileEmail"
            )
            .textContent =
            user.email || "";


        document
            .getElementById(
                "profileRole"
            )
            .textContent =
            profile.role === "admin"
                ? "Administrator"
                : "Student";


        document
            .getElementById(
                "avatar"
            )
            .textContent =
            (
                profile.full_name ||
                "E"
            )
                .charAt(0)
                .toUpperCase();


        if (
            profile.role === "admin"
        ) {

            document
                .getElementById(
                    "adminLink"
                )
                .classList
                .remove("hidden");

        }


    } catch (e) {

        document
            .getElementById(
                "profileName"
            )
            .textContent =
            e.message;

    }

})();
