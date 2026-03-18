import {defineConfig} from "vitepress";
import CodeAPI from "../capi/typedoc-sidebar.json";

function normalizeSidebar(items: any) {
  return items.map((item: any) => ({
    ...item,
    link: item.link ? item.link.replace(/^\/?docs\//, "/") : item.link,
    items: item.items ? normalizeSidebar(item.items) : undefined
  }));
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: "vue-mvvm",
    description: "A VitePress Site",
    themeConfig: {
        search: {
            provider: 'local'
        },

        // https://vitepress.dev/reference/default-theme-config
        nav: [
            {text: "Home", link: "/"},
            {text: "Guide", link: "/overview"},
            {text: "API", link: "/api/view-model"},
            {text: "Code API", link: "/capi/"}
        ],

        sidebar: [
            {
                items: [
                    {text: "Overview", link: "/overview"},
                    {text: "Getting Started", link: "/getting-started"},
                    {text: "Core Concept", link: "/core-concept"}
                ]
            },
            {
                text: "API",
                items: [
                    {text: "ViewModel", link: "/api/view-model"},
                    {text: "UserControl", link: "/api/user-control"},
                    {text: "Action", link: "/api/action"},
                    {text: "Dependency Injection", link: "/api/dependency-injection"},
                    {text: "Reactivity", link: "/api/reactivity"},
                    {text: "Delegate", link: "/api/delegate"},
                    {text: "Syncio", link: "/api/syncio"},
                ]
            },
            {
                text: "Extensions",
                items: [
                    {text: "Router", link: "/extensions/router"},
                    {text: "Dialog", link: "/extensions/dialog"},
                    {text: "Alert", link: "/extensions/alert"},
                ]
            },
            {
                text: "Examples",
                items: [
                    {text: "Markdown Examples", link: "/markdown-examples"},
                    {text: "Runtime API Examples", link: "/api-examples"}
                ]
            },
            {
                text: "Code API",
                items: normalizeSidebar(CodeAPI)
            }
        ],

        socialLinks: [
            {icon: "github", link: "https://github.com/bytelab-studio/vue-mvvm"}
        ]
    }
})
