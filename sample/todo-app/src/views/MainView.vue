<template>
    <div class="container">
        <h1 class="title">Todos</h1>
        <ul class="todo-list">
            <li v-for="todo of vm.unfinishedTodos" :key="todo.title" class="todo-item">
                <div class="todo-card" :class="{ done: todo.done }">
                    <div class="todo-text">
                        <h2 class="todo-title">{{ todo.title }}</h2>
                        <p class="todo-desc">{{ todo.description }}</p>
                    </div>
                    <div class="actions">
                        <button v-if="!todo.done" class="btn" @click="vm.markAsComplete(todo)">Mark as complete</button>
                        <button class="btn secondary" @click="vm.openEditModal(todo)">Edit</button>
                    </div>
                </div>
            </li>
            <li>
                <hr />
            </li>
            <li v-for="todo of vm.finishedTodos" :key="todo.title" class="todo-item">
                <div class="todo-card" :class="{ done: todo.done }">
                    <div class="todo-text">
                        <h2 class="todo-title">{{ todo.title }}</h2>
                        <p class="todo-desc">{{ todo.description }}</p>
                    </div>
                    <div class="actions">
                        <button v-if="!todo.done" class="btn" @click="vm.markAsComplete(todo)">Mark as complete</button>
                        <button class="btn secondary" @click="vm.openEditModal(todo)">Edit</button>
                    </div>
                </div>
            </li>
        </ul>
        <div class="footer-actions">
            <button class="btn primary" @click="vm.openCreation()">
                New Todo
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import {useViewModel} from "vue-mvvm";
import {MainViewModel} from "@/views/MainView.ts";

const vm: MainViewModel = useViewModel(MainViewModel);
</script>

<style scoped>
.container {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

.title {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.todo-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 0.75rem;
}

.todo-item {}

.todo-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 0.75rem;
    padding: 1rem;
    box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.todo-card.done .todo-title {
    text-decoration: line-through;
}

.todo-title {
    margin: 0 0 0.25rem 0;
    font-size: 1.125rem;
}

.todo-card.done .todo-desc {
    text-decoration: line-through;
}

.todo-desc {
    margin: 0;
    color: #4b5563;
}

.actions {
    display: flex;
    gap: 0.5rem;
}

.btn {
    appearance: none;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    color: #111827;
    padding: 0.5rem 0.9rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.btn:hover {
    background: #f3f4f6;
    border-color: #cfd4dc;
}

.btn.primary {
    background: #2563eb;
    border-color: #1d4ed8;
    color: white;
}

.btn.primary:hover {
    background: #1d4ed8;
}

.btn.secondary {
    background: #fff;
}

.footer-actions {
    margin-top: 1.25rem;
}
</style>