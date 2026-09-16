(async function () {

    try {

        const user =
            await requireUser();

        if (!user) return;


        const profile =
            await getProfile(user.id);


        document
            .getElementById("welcomeName")
            .textContent =
            "Welcome, " +
            (profile.full_name || "Student");


        const { data, error } =
            await supabaseClient
                .from("purchases")
                .select(
                    "course_id, courses(id,name,grade,price)"
                )
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "status",
                    "active"
                );


        if (error) {
            throw error;
        }


        const box =
            document.getElementById(
                "myCourses"
            );


        if (!data || !data.length) {

            box.innerHTML = `
                <div class="empty">
                    You have no purchased courses yet.
                    <a href="courses.html">
                        Browse courses
                    </a>
                </div>
            `;

            return;
        }


        box.innerHTML =
            data
                .map(x => `

                    <article class="course-card">

                        <span class="class-badge">
                            CLASS ${x.courses.grade}
                        </span>

                        <h3>
                            ${escapeHtml(
                                x.courses.name
                            )}
                        </h3>

                        <p>
                            Full access is enabled
                            for your account.
                        </p>

                        <a href="course.html?id=${x.courses.id}">
                            Open course →
                        </a>

                    </article>

                `)
                .join("");


    } catch (e) {

        document
            .getElementById("dashMsg")
            .textContent =
            e.message;

    }

})();


function escapeHtml(s) {

    return String(s).replace(
        /[&<>"']/g,
        m => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"

        }[m])
    );

}
