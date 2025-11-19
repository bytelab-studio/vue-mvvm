<template>
    <form @submit.prevent="vm.onSubmit">
        <h1>New Todo</h1>
        <input v-model="vm.title.value" type="text" required placeholder="Title" />
        <textarea v-model="vm.description.value" placeholder="Description" required></textarea>
        <button type="submit">
            Create
        </button>
    </form>
</template>

<script setup lang="ts">
import { useViewModel } from "vue-mvvm";
import { CreationViewModel } from "./CreationView";

const vm: CreationViewModel = useViewModel(CreationViewModel);
</script>