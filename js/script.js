import { supabase } from "./supabase.js";

console.log("TaskFlow JavaScript is connected!");

let currentUser = null;
let tasks = [];


// 1. USER DETAILS
function loadUser(user) {

    const username =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.username ||
        user.email?.split("@")[0] ||
        "User";

    document.getElementById("first-letter").textContent =
        username.charAt(0).toUpperCase();

    document.getElementById("welcome-username").textContent =
        username.charAt(0).toUpperCase() + username.slice(1);

    document.getElementById("username").textContent = username;
}


// 2. LOAD LOGGED-IN USER
async function loadLoggedInUser() {

    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        window.location.href = "index.html";
        return false;
    }

    currentUser = data.user;

    loadUser(currentUser);

    return true;
}


// 3. GREETING
const hour = new Date().getHours();

let greeting;

if (hour >= 4 && hour < 12) {
    greeting = "Good Morning";
}
else if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
}
else if (hour >= 17 && hour < 21) {
    greeting = "Good Evening";
}
else {
    greeting = "Good Night";
}

document.getElementById("time-of-day").textContent = greeting;


// 4. LOAD TASKS FROM SUPABASE
async function loadTasks() {

    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error(error);
        alert("Could not load your tasks: " + error.message);
        return;
    }

    tasks = data.map(function (task) {
        return {
            id: task.id,
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            status: task.status,
            dueDate: task.due_date
        };
    });

    displayTasks();
}


// 5. GET TASK STATUS
function getStatus(task) {

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate + "T00:00:00");

    if (task.status === "Completed") {
        return "Completed";
    }

    if (dueDate < today) {
        return "Overdue";
    }

    return "Pending";
}


// 6. UPDATE DASHBOARD
function updateProgress() {

    const total = tasks.length;

    const completed = tasks.filter(function (task) {
        return getStatus(task) === "Completed";
    }).length;

    const pending = tasks.filter(function (task) {
        return getStatus(task) === "Pending";
    }).length;

    const overdue = tasks.filter(function (task) {
        return getStatus(task) === "Overdue";
    }).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    document.getElementById("total-task-count").textContent = total;

    document.getElementById("completed-task-count").textContent =
        completed;

    document.getElementById("pending-task-count").textContent =
        pending;

    document.getElementById("overdue-task-count").textContent =
        overdue;

    document.getElementById("progress-text").textContent =
        percentage + "%";

    document.getElementById("progress-bar").style.width =
        percentage + "%";
}


// 7. DISPLAY TASKS
function displayTasks() {

    const taskList = document.getElementById("task-list");

    taskList.innerHTML = "";

    const search = document
        .getElementById("search-input")
        .value
        .toLowerCase();

    const statusFilter = document
        .getElementById("status-filter")
        .value;

    const priorityFilter = document
        .getElementById("priority-filter")
        .value;

    const filteredTasks = tasks.filter(function (task) {

        const status = getStatus(task);

        return (
            task.title.toLowerCase().includes(search) &&
            (
                statusFilter === "all" ||
                statusFilter === "" ||
                status === statusFilter
            ) &&
            (
                priorityFilter === "all" ||
                priorityFilter === "" ||
                task.priority === priorityFilter
            )
        );
    });

    filteredTasks.forEach(function (task) {

        const status = getStatus(task);

        taskList.innerHTML += `
            <div class="task-card">

                <div class="card-section-1">
                    <h3>${escapeHTML(task.title)}</h3>
                    <p>${escapeHTML(task.description)}</p>
                </div>

                <div class="card-section-2">
                    <p class="${task.priority.toLowerCase()}">
                        ${task.priority}
                    </p>
                </div>

                <div class="card-section-3">
                    <p class="status ${status.toLowerCase()}">
                        ${status}
                    </p>
                </div>

                <div class="card-section-4">
                    <p class="date-class">
                        <img src="images/calender.svg" alt="">
                        ${task.dueDate}
                    </p>
                </div>

                <div class="card-section-5">

                    <button
                        class="edit-task-btn"
                        data-id="${task.id}"
                        title="Edit task"
                    >
                        <img src="images/edit.svg" alt="Edit">
                    </button>

                    <button
                        class="delete-task-btn"
                        data-id="${task.id}"
                        title="Delete task"
                    >
                        <img src="images/delete.svg" alt="Delete">
                    </button>

                </div>

            </div>
        `;
    });

    document.getElementById("task-list-count").textContent =
        filteredTasks.length + " Tasks";

    updateProgress();
}


// 8. TASK FORM ELEMENTS
const taskForm = document.getElementById("task-form");

const taskFormContainer =
    document.getElementById("task-form-container");


// 9. OPEN ADD TASK FORM
function openAddForm() {

    taskForm.reset();

    document.getElementById("task-id").value = "";

    document.getElementById("form-title").textContent =
        "Add New Task";

    document.getElementById("task-status").value =
        "Pending";

    taskFormContainer.classList.add("active");
}


// 10. OPEN EDIT TASK FORM
function openEditForm(id) {

    const task = tasks.find(function (task) {
        return task.id === id;
    });

    if (!task) {
        return;
    }

    document.getElementById("task-id").value = task.id;

    document.getElementById("task-title").value =
        task.title;

    document.getElementById("task-description").value =
        task.description;

    document.getElementById("task-priority").value =
        task.priority;

    document.getElementById("task-status").value =
        task.status;

    document.getElementById("task-date").value =
        task.dueDate;

    document.getElementById("form-title").textContent =
        "Edit Task";

    taskFormContainer.classList.add("active");
}


// 11. ADD OR UPDATE TASK IN SUPABASE
taskForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const id = document.getElementById("task-id").value;

    const taskData = {
        title: document.getElementById("task-title").value.trim(),
        description: document
            .getElementById("task-description")
            .value
            .trim() || null,
        priority: document.getElementById("task-priority").value,
        status: document.getElementById("task-status").value,
        due_date: document.getElementById("task-date").value
    };

    if (!taskData.title || !taskData.due_date) {
        alert("Please add a task title and due date.");
        return;
    }

    let error;

    if (id) {

        const result = await supabase
            .from("tasks")
            .update(taskData)
            .eq("id", id);

        error = result.error;

    } else {

        const result = await supabase
            .from("tasks")
            .insert({
                ...taskData,
                user_id: currentUser.id
            });

        error = result.error;
    }

    if (error) {
        console.error(error);
        alert("Could not save task: " + error.message);
        return;
    }

    taskFormContainer.classList.remove("active");

    await loadTasks();
});


// 12. CANCEL FORM
document
    .getElementById("cancel-task")
    .addEventListener("click", function () {

        taskFormContainer.classList.remove("active");
    });


// 13. DELETE TASK FROM SUPABASE
async function deleteTask(id) {

    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Could not delete task: " + error.message);
        return;
    }

    await loadTasks();
}


// 14. EDIT AND DELETE BUTTONS
document
    .getElementById("task-list")
    .addEventListener("click", function (event) {

        const button = event.target.closest("button");

        if (!button) {
            return;
        }

        const id = button.dataset.id;

        if (button.classList.contains("edit-task-btn")) {
            openEditForm(id);
        }

        if (button.classList.contains("delete-task-btn")) {
            deleteTask(id);
        }
    });


// 15. ADD NEW TASK BUTTON
document
    .getElementById("add-new-task")
    .addEventListener("click", openAddForm);


// 16. SEARCH AND FILTERS
document
    .getElementById("search-input")
    .addEventListener("input", displayTasks);

document
    .getElementById("status-filter")
    .addEventListener("change", displayTasks);

document
    .getElementById("priority-filter")
    .addEventListener("change", displayTasks);


// 17. RESET FILTERS
document
    .getElementById("reset-button")
    .addEventListener("click", function () {

        document.getElementById("search-input").value = "";

        document.getElementById("status-filter").value = "";

        document.getElementById("priority-filter").value = "";

        displayTasks();
    });


// 18. ESCAPE HTML
function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function (character) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}


// 19. START DASHBOARD
async function startDashboard() {

    const isLoggedIn = await loadLoggedInUser();

    if (!isLoggedIn) {
        return;
    }

    await loadTasks();
}

startDashboard();