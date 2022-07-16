import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import VueCookies from "vue-cookies";

const app = createApp(App);
app.use(createPinia());
app.use(VueCookies);
app.use(
  createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: "/",
        name: "home",
        component: () => import("@/views/HomeView.vue"),
      },
      {
        path: "/miner/mine_registration",
        name: "Miner Mine Registration",
        component: () => import("@/views/Miner/MineRegistration.vue"),
      },
      {
        path: "/login",
        name: "Login",
        component: () => import("@/views/Login.vue"),
        props: (route) => ({ login_id: route.query.login_id }),
      },
      {
        path: "/miner/ores_registration",
        name: "Miner Ores Registration",
        component: () => import("@/views/Miner/OresRegistration.vue"),
      },
      {
        path: "/header",
        name: "Header",
        component: () => import("@/components/Header.vue"),
      },
      {
        path: "/alert",
        name: "Alert",
        component: () => import("@/components/Alert.vue"),
      } 
    ],
  })
);
app.mount("#app");
