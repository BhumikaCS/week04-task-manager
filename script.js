const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const totalCount = document.getElementById("totalCount");
const errorMessage = document.getElementById("errorMessage");
const emptyMessage = document.getElementById("emptyMessage");
const filterButtons = document.querySelectorAll(".filter-btn");

let tasks = [];
let currentFilter = "all";

try {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(function(task) {
            return task &&
                typeof task.id === "string" &&
                typeof task.text === "string" &&
                typeof task.completed === "boolean";
        });
    }
} catch (error) {
    tasks = [];
}

function saveTasks() {
    try {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    } catch (error) {
        errorMessage.textContent = "Unable to save tasks in this browser.";
    }
}

function updateCounts() {
    let pending = 0;
    let completed = 0;

    tasks.forEach(function(task) {
        if (task.completed) {
            completed++;
        } else {
            pending++;
        }
    });

    pendingCount.textContent = pending;
    completedCount.textContent = completed;

    totalCount.textContent = tasks.length +
        (tasks.length === 1 ? " task" : " tasks");
}

function displayTasks() {
    taskList.replaceChildren();

    const filteredTasks = tasks.filter(function(task) {
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    filteredTasks.forEach(function(task) {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Mark task as completed");

        checkbox.addEventListener("change", function() {
            task.completed = checkbox.checked;
            saveTasks();
            displayTasks();
        });

        const taskText = document.createElement("span");
        taskText.className = "task-text";
        taskText.textContent = task.text;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            tasks = tasks.filter(function(item) {
                return item.id !== task.id;
            });

            saveTasks();
            displayTasks();
        });

        li.appendChild(checkbox);
        li.appendChild(taskText);
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });

    if (filteredTasks.length === 0) {
        emptyMessage.style.display = "block";

        if (tasks.length === 0) {
            emptyMessage.querySelector("h3").textContent = "No tasks yet";
            emptyMessage.querySelector("p").textContent =
                "Add your first task above and get started!";
        } else {
            emptyMessage.querySelector("h3").textContent = "Nothing to show";
            emptyMessage.querySelector("p").textContent =
                "There are no tasks in this filter.";
        }
    } else {
        emptyMessage.style.display = "none";
    }

    updateCounts();
}

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === "") {
        errorMessage.textContent = "Please enter a task first!";
        taskInput.focus();
        return;
    }

    const newTask = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        text: text,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();

    taskInput.value = "";
    errorMessage.textContent = "";

    displayTasks();
    taskInput.focus();
});

taskInput.addEventListener("input", function() {
    errorMessage.textContent = "";
});

filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        currentFilter = button.getAttribute("data-filter");

        filterButtons.forEach(function(filterButton) {
            const isActive = filterButton === button;

            filterButton.classList.toggle("active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });

        displayTasks();
    });
});

displayTasks();