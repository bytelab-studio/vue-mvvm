<template>
    <div>
        <h1>Todos</h1>
        <ul>
            <li v-for="todo of vm.todos.value">
                <div>
                    <h2>{{ todo.title }}</h2>
                    <p>{{ todo.description }}</p>
                    <button v-if="!todo.done" @click="vm.markAsComplete(todo)">Mark as complete</button>
                </div>
            </li>
        </ul>
        <div>
            <button @click="vm.openCreation()">
                New Todo
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import {useViewModel} from "vue-mvvm";
import {MainViewModel} from "@/views/MainView.ts";

const vm = useViewModel(MainViewModel);
</script>