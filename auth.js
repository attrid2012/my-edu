async function getSession() {

    const { data, error } =
        await supabaseClient.auth.getSession();

    if (error) {
        throw error;
    }

    return data.session;
}


async function requireUser() {

    const session = await getSession();

    if (!session) {

        location.href = "login.html";

        return null;
    }

    return session.user;
}


async function getProfile(userId) {

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

    if (error) {
        throw error;
    }

    return data;
}


async function registerUser(e) {

    e.preventDefault();

    const msg =
        document.getElementById("msg");

    msg.textContent =
        "Creating account...";


    const name =
        document.getElementById("name")
            .value
            .trim();

    const email =
        document.getElementById("email")
            .value
            .trim();

    const password =
        document.getElementById("password")
            .value;


    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password,

            options: {

                data: {
                    full_name: name
                },

                emailRedirectTo:
                    location.origin +
                    "/education-at-glance/login.html"
            }

        });


    if (error) {

        msg.textContent =
            error.message;

        return;
    }


    if (data.session) {

        location.href =
            "dashboard.html";

    } else {

        msg.textContent =
            "Account created. Check your email if email confirmation is enabled in Supabase.";

    }

}


async function loginUser(e) {

    e.preventDefault();

    const msg =
        document.getElementById("msg");

    msg.textContent =
        "Signing in...";


    const email =
        document.getElementById("email")
            .value
            .trim();

    const password =
        document.getElementById("password")
            .value;


    const { error } =
        await supabaseClient.auth
            .signInWithPassword({

                email: email,

                password: password

            });


    if (error) {

        msg.textContent =
            error.message;

        return;
    }


    location.href =
        "dashboard.html";
}


async function logout() {

    await supabaseClient.auth.signOut();

    location.href =
        "index.html";
}


document.addEventListener(
    "DOMContentLoaded",
    () => {

        const btn =
            document.getElementById(
                "logoutBtn"
            );

        if (btn) {

            btn.addEventListener(
                "click",
                logout
            );

        }


        const btn2 =
            document.getElementById(
                "logout2"
            );

        if (btn2) {

            btn2.addEventListener(
                "click",
                logout
            );

        }

    }
);
