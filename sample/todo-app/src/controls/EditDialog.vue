<template>
    <div class="dialog">
        <div class="content">
            <form @submit.prevent="vm.onSubmit">
                <h1>Edit: {{ vm.todo.title }}</h1>
                <input v-model="vm.title" type="text" placeholder="Title" />
                <textarea v-model="vm.description" placeholder="Description"></textarea>
                <label>
                    <span>Done</span>
                    <input type="checkbox" :checked="vm.done" @click="vm.done = !vm.done" />
                </label>
                <button type="submit">
                    Save
                </button>
                <button @click="vm.onCancel">
                    Cancel
                </button>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import {EditDialogControl} from "@/controls/EditDialog.ts";
import {useDialogControl} from "vue-mvvm";

const vm: EditDialogControl = useDialogControl(EditDialogControl);
</script>

<style scoped>
.dialog {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #0000001F;
    display: flex;
    justify-content: center;
    align-items: center;
}

.dialog > .content {
    background: white;
    padding: 1.25rem;
    border-radius: 0.75rem;
    width: min(92vw, 560px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

form {
    display: grid;
    gap: 0.75rem;
}

h1 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
}

input[type="text"],
input:not([type="checkbox"]),
textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    background: #fff;
    font-size: 1rem;
}

textarea {
    min-height: 100px;
    resize: vertical;
}

label {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    user-select: none;
}

button {
    appearance: none;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    color: #111827;
    padding: 0.5rem 0.9rem;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
}

button[type="submit"] {
    background: #2563eb;
    border-color: #1d4ed8;
    color: #fff;
}

button[type="submit"]:hover {
    background: #1d4ed8;
}

/* Prevent any accidental overflow from borders/padding when width:100% is applied */
input:not([type="checkbox"]),
textarea {
    box-sizing: border-box;
}
</style>