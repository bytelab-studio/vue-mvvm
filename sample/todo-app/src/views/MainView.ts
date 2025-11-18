import {type Component} from "vue";
import {ViewModel} from "vue-mvvm";

import MainView from "@/views/MainView.vue";


export class MainViewModel extends ViewModel {
    public static component: Component = MainView;

    public constructor() {
        super();
    }
}