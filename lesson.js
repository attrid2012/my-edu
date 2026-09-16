(async function () {

    const user =
        await requireUser();

    if (!user) return;


    const params =
        new URLSearchParams(
            location.search
        );


    const id =
        params.get("id");

    const course =
        params.get("course");


    if (course) {

        document
            .getElementById(
                "lessonBack"
            )
            .href =
            "course.html?id=" +
            encodeURIComponent(course);

    }


    try {

        const {
            data: lesson,
            error
        } =
            await supabaseClient
                .from("lessons")
                .select(
                    "id,title,video_url,notes_url,subjects(name,course_id)"
                )
                .eq(
                    "id",
                    id
                )
                .single();


        if (error) {
            throw error;
        }


        const {
            data: purchase
        } =
            await supabaseClient
                .from("purchases")
                .select("id")
                .eq(
                    "user_id",
                    user.id
                )
                .eq(
                    "course_id",
                    lesson.subjects.course_id
                )
                .eq(
                    "status",
                    "active"
                )
                .maybeSingle();


        if (!purchase) {

            throw new Error(
                "You do not have access to this lesson."
            );

        }


        let video = "";


        if (lesson.video_url) {

            const u =
                lesson.video_url;


            if (
                /youtube\.com|youtu\.be/
                    .test(u)
            ) {

                let vid = "";


                try {

                    const url =
                        new URL(u);


                    if (
                        url.hostname
                            .includes(
                                "youtu.be"
                            )
                    ) {

                        vid =
                            url.pathname
                                .slice(1);

                    } else {

                        vid =
                            url.searchParams
                                .get("v") ||
                            url.pathname
                                .split("/")
                                .pop();

                    }

                } catch {

                }


                if (vid) {

                    video = `

                        <div class="video-wrap">

                            <iframe
                                src="https://www.youtube.com/embed/${encodeURIComponent(vid)}"
                                title="Lesson video"
                                allowfullscreen>
                            </iframe>

                        </div>

                    `;

                }

            }


            if (!video) {

                video = `

                    <p>

                        <a
                            class="btn primary"
                            href="${esc(lesson.video_url)}"
                            target="_blank"
                            rel="noopener">

                            Open video

                        </a>

                    </p>

                `;

            }

        } else {

            video = `

                <div class="video-placeholder">

                    Video will be added by the admin.

                </div>

            `;

        }


        document
            .getElementById(
                "lessonBox"
            )
            .innerHTML = `

                <span class="eyebrow">

                    ${esc(
                        lesson.subjects.name
                    )}

                </span>


                <h1>

                    ${esc(
                        lesson.title
                    )}

                </h1>


                ${video}


                <div class="notes-box">

                    <h2>
                        Notes
                    </h2>


                    ${
                        lesson.notes_url

                        ?

                        `
                        <a
                            class="btn ghost"
                            href="${esc(
                                lesson.notes_url
                            )}"
                            target="_blank"
                            rel="noopener">

                            Open / Download Notes

                        </a>
                        `

                        :

                        `
                        <p class="muted">

                            Notes will be added
                            by the admin.

                        </p>
                        `
                    }

                </div>

            `;


    } catch (e) {

        document
            .getElementById(
                "lessonBox"
            )
            .innerHTML = `

                <div class="empty">

                    ${esc(e.message)}

                </div>

            `;

    }

})();


function esc(s) {

    return String(s || "").replace(
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
