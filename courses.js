(async function () {

    const grid =
        document.getElementById(
            "courseGrid"
        );


    try {

        const session =
            await getSession();


        const {
            data: courses,
            error
        } =
            await supabaseClient
                .from("courses")
                .select("*")
                .order("grade");


        if (error) {
            throw error;
        }


        let owned =
            new Set();


        if (session) {

            const { data: purchases } =
                await supabaseClient
                    .from("purchases")
                    .select("course_id")
                    .eq(
                        "user_id",
                        session.user.id
                    )
                    .eq(
                        "status",
                        "active"
                    );


            (purchases || [])
                .forEach(x => {
                    owned.add(
                        x.course_id
                    );
                });

        }


        grid.innerHTML =
            (courses || [])
                .map(c => `

                    <article
                        class="course-card
                        ${owned.has(c.id)
                            ? "owned"
                            : ""}">

                        <span class="class-badge">
                            CLASS ${c.grade}
                        </span>

                        <h3>
                            ${escapeHtml(
                                c.name
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                c.description ||
                                "Complete subject-wise course."
                            )}
                        </p>

                        <strong>
                            ₹${Number(c.price)
                                .toLocaleString("en-IN")}
                        </strong>

                        ${
                            owned.has(c.id)

                            ?

                            `
                            <a href="course.html?id=${c.id}">
                                Open course →
                            </a>
                            `

                            :

                            `
                            <span class="coming">
                                Payment coming soon
                            </span>
                            `
                        }

                    </article>

                `)
                .join("");


    } catch (e) {

        grid.innerHTML = `
            <div class="empty">
                ${escapeHtml(e.message)}
            </div>
        `;

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
