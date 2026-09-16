(async function () {

    const user =
        await requireUser();

    if (!user) return;


    try {

        const profile =
            await getProfile(
                user.id
            );


        if (
            profile.role !== "admin"
        ) {

            document
                .querySelector("main")
                .innerHTML = `

                    <div class="empty">

                        Access denied.
                        Your account is not an admin.

                    </div>

                `;

            return;
        }


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


        const courseSelect =
            document.getElementById(
                "courseId"
            );


        const purchaseCourseSelect =
            document.getElementById(
                "purchaseCourseId"
            );


        courseSelect.innerHTML =
            courses
                .map(c => `

                    <option value="${c.id}">

                        Class ${c.grade}
                        —
                        ${esc(c.name)}

                    </option>

                `)
                .join("");


        purchaseCourseSelect.innerHTML =
            courseSelect.innerHTML;


        await loadSubjects(
            courseSelect.value
        );


        courseSelect.addEventListener(
            "change",
            () =>
                loadSubjects(
                    courseSelect.value
                )
        );


        document
            .getElementById(
                "lessonForm"
            )
            .addEventListener(
                "submit",
                addLesson
            );


        document
            .getElementById(
                "purchaseForm"
            )
            .addEventListener(
                "submit",
                grantPurchase
            );


        const {
            data: users
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "id,full_name,role,created_at"
                )
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                )
                .limit(20);


        document
            .getElementById(
                "users"
            )
            .innerHTML =
            (users || [])
                .map(u => `

                    <div class="user-row">

                        <span>

                            <b>
                                ${esc(
                                    u.full_name ||
                                    "Unnamed"
                                )}
                            </b>

                            <small>
                                ${u.id}
                            </small>

                        </span>

                        <span>
                            ${u.role}
                        </span>

                    </div>

                `)
                .join("") ||
            "No users yet.";


    } catch (e) {

        document
            .getElementById(
                "adminMsg"
            )
            .textContent =
            e.message;

    }



    async function loadSubjects(
        courseId
    ) {

        const {
            data
        } =
            await supabaseClient
                .from("subjects")
                .select(
                    "id,name"
                )
                .eq(
                    "course_id",
                    courseId
                )
                .order(
                    "sort_order"
                );


        document
            .getElementById(
                "subjectId"
            )
            .innerHTML =
            (data || [])
                .map(s => `

                    <option value="${s.id}">

                        ${esc(s.name)}

                    </option>

                `)
                .join("");

    }



    async function addLesson(e) {

        e.preventDefault();


        const msg =
            document.getElementById(
                "adminMsg"
            );


        msg.textContent =
            "Saving...";


        const {
            error
        } =
            await supabaseClient
                .from("lessons")
                .insert({

                    subject_id:
                        document.getElementById(
                            "subjectId"
                        ).value,

                    title:
                        document.getElementById(
                            "lessonTitle"
                        ).value.trim(),

                    video_url:
                        document.getElementById(
                            "videoUrl"
                        ).value.trim() ||
                        null,

                    notes_url:
                        document.getElementById(
                            "notesUrl"
                        ).value.trim() ||
                        null

                });


        msg.textContent =
            error
                ? error.message
                : "Lesson added successfully.";


        if (!error) {

            e.target.reset();

        }

    }



    async function grantPurchase(e) {

        e.preventDefault();


        const userId =
            document
                .getElementById(
                    "userId"
                )
                .value
                .trim();


        const courseId =
            document
                .getElementById(
                    "purchaseCourseId"
                )
                .value;


        const {
            error
        } =
            await supabaseClient
                .from("purchases")
                .upsert(

                    {
                        user_id:
                            userId,

                        course_id:
                            courseId,

                        status:
                            "active",

                        payment_provider:
                            "manual",

                        payment_id:
                            null
                    },

                    {
                        onConflict:
                            "user_id,course_id"
                    }

                );


        alert(
            error
                ? error.message
                : "Course access granted."
        );

    }

})();


function esc(s) {

    return String(s || "")
        .replace(
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
