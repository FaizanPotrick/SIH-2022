import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";
import VueCookies from "vue-cookies";
import OpenLayersMap from "vue3-openlayers";
import "vue3-openlayers/dist/vue3-openlayers.css";

const app = createApp(App);

const Authentication = async () => {
  const { data } = await axios.get("/api/authentication");
  if (!data) {
    return { path: "/login" };
  }
};

const PageAccess = (to) => {
  to.meta.type_of_user.forEach((type_of_user) => {
    if (type_of_user === $cookies.get("type_of_user")) {
      if ($cookies.get("type_of_user") === "officer") {
        to.meta.type_of_region.forEach((type_of_region) => {
          if (type_of_region === $cookies.get("type_of_region")) {
            return (to.meta.access = true);
          }
        });
      }
      return (to.meta.access = true);
    }
  });
};

app.use(createPinia());
app.use(OpenLayersMap);
app.use(VueCookies);

app.use(
  createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
      {
        path: "/",
        name: "home",
        component: () => import("@/views/Home.vue"),
      },
      {
        path: "/login",
        name: "login",
        component: () => import("@/views/Login.vue"),
      },
      {
        path: "/forgot_password",
        name: "forgot password",
        component: () => import("@/views/ForgotPassword.vue"),
      },
      {
        path: "/weight_details",
        name: "Weight Details",
        component: () => import("@/views/TestWeightDetails.vue"),
      },
      {
        path: "/sample_test",
        name: "Sample Test",
        component: () => import("@/views/SampleTest.vue"),
      },
      {
        path: "/stocker",
        name: "Stocker",
        component: () => import("@/views/Stocker.vue"),
      },
      {
        path: "/warehouse",
        name: "Warehouse",
        component: () => import("@/views/Warehouse.vue"),
      },
      {
        path: "/dashboard",
        name: "dashboard",
        component: () => import("@/views/DashBoard.vue"),
        children: [
          {
            path: "",
            name: "home_dashboard",
            meta: {
              active: "home",
              access: false,
              type_of_user: [
                "officer",
                "organisation",
                "miner",
                "checkpoint",
                "lab",
              ],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => {
              if ($cookies.get("type_of_user") === "officer") {
                return import("@/views/Dashboard/Officer.vue");
              } else if ($cookies.get("type_of_user") === "organisation") {
                return import("@/views/Dashboard/Organisation.vue");
              } else if ($cookies.get("type_of_user") === "miner") {
                return import("@/views/Dashboard/Mine.vue");
              } else if ($cookies.get("type_of_user") === "checkpoint") {
                return import("@/views/Dashboard/CheckPoint.vue");
              } else {
                return import("@/views/Dashboard/Lab.vue");
              }
            },
          },
          {
            path: "officers/:region_type/:region_id",
            name: "officer_dashboard",
            meta: {
              active: "officers",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["country", "state"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Dashboard/Officer.vue"),
          },
          {
            path: "organisations/:organisation_id",
            name: "organisation_dashboard",
            meta: {
              active: "organisations",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["country", "state"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Dashboard/Organisation.vue"),
          },
          {
            path: "mines/:mine_id",
            name: "mine_dashboard",
            meta: {
              active: "mines",
              access: false,
              type_of_user: ["officer", "organisation"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Dashboard/Mine.vue"),
          },
          {
            path: "officer_registration",
            name: "officer_registration",
            meta: {
              active: "home",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["country", "state"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/Officer.vue"),
          },
          {
            path: "organisation_registration",
            name: "organisation_registration",
            meta: {
              active: "home",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/Organisation.vue"),
          },
          {
            path: "mine_registration",
            name: "mine_registration",
            meta: {
              active: "home",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/Mine.vue"),
          },
          {
            path: "mine_registration/:mine_id/warehouse_registration",
            name: "warehouse_registration",
            meta: {
              active: "home",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/Warehouse.vue"),
          },
          {
            path: "checkpoint_registration",
            name: "checkpoint_registration",
            meta: {
              active: "home",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/CheckPoint.vue"),
          },
          {
            path: "lab_registration",
            name: "lab_registration",
            meta: {
              active: "home",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/Lab.vue"),
          },
          {
            path: "ceo_registration",
            name: "ceo_registration",
            meta: {
              active: "home",
              access: false,
              type_of_user: ["organisation"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/CEO.vue"),
          },
          {
            path: "officers",
            name: "officers",
            meta: {
              active: "officers",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["country", "state"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/List/Officers.vue"),
          },
          {
            path: "organisations",
            name: "organisations",
            meta: {
              active: "organisations",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["country", "state"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/List/Organisations.vue"),
          },
          {
            path: "mines",
            name: "mines",
            meta: {
              active: "mines",
              access: false,
              type_of_user: ["officer", "organisation"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/List/Mines.vue"),
          },
          {
            path: "mines/:mine_id/manager_registration",
            name: "manager_registration",
            meta: {
              active: "mines",
              access: false,
              type_of_user: ["organisation"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/Manager.vue"),
          },
          {
            path: "mined_batches",
            name: "mined_batches",
            meta: {
              active: "mined batches",
              access: false,
              type_of_user: ["officer", "miner"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/List/MinedBatches.vue"),
          },
          {
            path: "tested_mined_batches",
            name: "tested_mined_batches",
            meta: {
              active: "tested mined batches",
              access: false,
              type_of_user: ["officer", "miner"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/List/TestedMinedBatches.vue"),
          },
          {
            path: "tested_mined_batches/:tested_mined_batch_id",
            name: "tested_mined_batch",
            meta: {
              active: "tested mined batches",
              access: false,
              type_of_user: ["officer", "miner"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/ApproveMinedBatch.vue"),
          },
          {
            path: "mined_batches/:batch_id",
            name: "mined_batch",
            meta: {
              active: "mined batches",
              access: false,
              type_of_user: ["officer", "miner", "lab"],
              type_of_region: ["district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/MinedBatch.vue"),
          },
          {
            path: "mines/:mine_id/mined_batches",
            name: "officer_mined_batches",
            meta: {
              active: "mines",
              access: false,
              type_of_user: ["officer", "organisation"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/List/MinedBatches.vue"),
          },
          {
            path: "mines/:mine_id/mined_batches/:batch_id",
            name: "officer_mined_batch",
            meta: {
              active: "mines",
              access: false,
              type_of_user: ["officer", "organisation"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/MinedBatch.vue"),
          },
          {
            path: "add_mined_batch",
            name: "add_mined_batch",
            meta: {
              active: "home",
              access: false,
              type_of_user: ["miner"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/MinedBatch.vue"),
          },
          {
            path: "mined_batches/:mined_batch_id/testing_mined_batch",
            name: "testing_mined_batch",
            meta: {
              active: "mined batches",
              access: false,
              type_of_user: ["miner"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () =>
              import("@/views/Registration/TestedMinedBatch.vue"),
          },
          {
            path: "mined_batches/:batch_id/approve_mined_batch",
            name: "approve_mined_batch",
            meta: {
              active: "mined batches",
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () =>
              import("@/views/Registration/OfficerMinedBatch.vue"),
          },
          {
            path: "transactions",
            name: "transactions",
            meta: {
              active: "transactions",
              access: false,
              type_of_user: ["organisation", "miner"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/List/Transactions.vue"),
          },
          {
            path: "add_transaction",
            name: "add_transaction",
            meta: {
              active: "add transaction",
              access: false,
              type_of_user: ["miner"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Registration/Transaction.vue"),
          },
          {
            path: "approve_transaction",
            name: "approve_transaction ",
            meta: {
              active: "approve transaction",
              access: false,
              type_of_user: ["organisation", "checkpoint"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () =>
              import("@/views/Registration/ApproveTransaction.vue"),
          },
          {
            path: "transactions/:transaction_id",
            name: "transaction",
            meta: {
              active: "transactions",
              access: false,
              type_of_user: ["miner", "checkpoint"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Transaction.vue"),
          },
          {
            path: "mines/:mine_id/transactions",
            name: "officer_transactions",
            meta: {
              active: "mines",
              access: false,
              type_of_user: ["officer", "organisation"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/List/Transactions.vue"),
          },
          {
            path: "mines/:mine_id/transactions/:transaction_id",
            name: "officer_transaction",
            meta: {
              active: "mines",
              access: false,
              type_of_user: ["officer", "organisation"],
              type_of_region: ["country", "state", "district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/Transaction.vue"),
          },
          {
            path: "suspisious_activity",
            name: "suspisious_activity",
            meta: {
              access: false,
              type_of_user: ["officer"],
              type_of_region: ["district"],
            },
            beforeEnter: [Authentication, PageAccess],
            component: () => import("@/views/List/SuspisiousActivity.vue"),
          },
        ],
      },
      {
        path: "/:catchAll(.*)",
        name: "404",
        component: () => import("@/components/PageNotFound.vue"),
      },
    ],
  })
);
app.mount("#app");
