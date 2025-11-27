<template>
    <form class="form" @submit.prevent="vm.onSubmit">
        <h1 class="title">New Todo</h1>
        <input v-model="vm.title" class="input" type="text" required placeholder="Title" />
        <textarea v-model="vm.description" class="textarea" placeholder="Description" required></textarea>
        <button class="btn primary" type="submit">
            Create
        </button>
    </form>
</template>

<script setup lang="ts">
import { useViewModel } from "vue-mvvm";
import { CreationViewModel } from "./CreationView";

const vm: CreationViewModel = useViewModel(CreationViewModel);
</script>

<style scoped>
.form {
    max-width: 640px;
    margin: 2rem auto;
    padding: 1rem;
    display: grid;
    gap: 0.75rem;
}

.title {
    margin: 0 0 0.5rem 0;
}

.input,
.textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #fff;
    font-size: 1rem;
}

.textarea {
    min-height: 120px;
    resize: vertical;
}

.btn {
    appearance: none;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    color: #111827;
    padding: 0.55rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    justify-self: start;
}

.btn:hover {
    background: #f3f4f6;
}

.btn.primary {
    background: #2563eb;
    border-color: #1d4ed8;
    color: #fff;
}

.btn.primary:hover {
    background: #1d4ed8;
}
</style>