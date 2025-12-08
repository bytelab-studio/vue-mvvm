import { withMermaid } from "vitepress-plugin-mermaid";

// https://vitepress.dev/reference/site-config
export default withMermaid({
    title: "vue-mvvm",
    description: "A VitePress Site",
    themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: "Home", link: "/" },
            { text: "Examples", link: "/markdown-examples" }
        ],

        sidebar: [
            {
                items: [
                    { text: "Overview", link: "/overview" },
                    { text: "Getting Started", link: "/getting-started" },
                    { text: "Core Concept", link: "/core-concept" }
                ]
            },
            {
                text: "API",
                items: [
                    { text: "ViewModel", link: "/api/view-model" },
                    { text: "UserControl", link: "/api/user-control" },
                    { text: "Action", link: "/api/action" },
                    { text: "Dependency Injection", link: "/api/dependency-injection" },
                ]
            },
            {
                text: "Extensions",
                items: [
                    { text: "Router", link: "/extensions/router"}
                ]
            },
            {
                text: "Examples",
                items: [
                    { text: "Markdown Examples", link: "/markdown-examples" },
                    { text: "Runtime API Examples", link: "/api-examples" }
                ]
            }
        ],

        socialLinks: [
            { icon: "github", link: "https://github.com/vuejs/vitepress" }
        ]
    }
})
