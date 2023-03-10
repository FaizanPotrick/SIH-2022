<script setup>
import { onMounted } from "vue";
import axios from "axios";
import { ref } from "vue";
import useAlertStore from "@/stores/Alert";

const { open_alert_box } = useAlertStore();
const center = ref([78.9629, 20.5937]);
const zoom = ref(4);
const lab = ref({
  lab_name: "",
  name: "",
  email_address: "",
  coordinates: {
    latitude: 0,
    longitude: 0,
  },
});
const loading = ref(false);

const register_fn = async () => {
  if (
    lab.value.coordinates.latitude === 0 ||
    lab.value.coordinates.longitude === 0
  ) {
    return open_alert_box("Please select a location", "warning");
  }
  loading.value = true;
  try {
    await axios.post("/api/registration/lab", lab.value);
    lab.value = {
      lab_name: "",
      name: "",
      email_address: "",
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    };
  } catch (err) {
    open_alert_box(err.response.data.message, err.response.data.type);
  }
  loading.value = false;
};

const marker_selector = async (e) => {
  lab.value.coordinates = {
    latitude: e.feature.values_.geometry.flatCoordinates[1],
    longitude: e.feature.values_.geometry.flatCoordinates[0],
  };
};

onMounted(async () => {
  const { data } = await axios.get("/api/region/coordinates");
  center.value = [data.longitude, data.latitude];
  zoom.value = 10;
});
</script>

<template>
  <div class="flex justify-center items-center">
    <div
      class="max-w-2xl w-full p-10 bg-white border shadow-md rounded-2xl text-gray-800 m-5 sm:m-10"
    >
      <div class="mb-4">
        <div class="font-semibold text-2xl text-yellow-700">
          Lab Registration
        </div>
        <div class="text-gray-500 text-sm">Register a lab.</div>
      </div>
      <form class="space-y-5 drop-shadow-md" @submit.prevent="register_fn()">
        <input
          type="text"
          class="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-yellow-600/40"
          placeholder="Lab Name"
          v-model="lab.lab_name"
          maxlength="300"
          required
        />
        <div class="grid gap-6 sm:grid-cols-2">
          <input
            type="text"
            class="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-yellow-600/40"
            placeholder="Manager Name"
            v-model="lab.name"
            maxlength="150"
            required
          />
          <input
            type="email"
            class="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:border-yellow-600/40"
            placeholder="Email Address"
            v-model="lab.email_address"
            maxlength="150"
            pattern="[a-z0-9._]+@[a-z0-9]+\.[a-z]+"
            required
          />
        </div>
        <ol-map style="height: 30vh">
          <ol-view :center="center" :zoom="zoom" projection="EPSG:4326" />
          <ol-tile-layer>
            <ol-source-osm />
          </ol-tile-layer>
          <ol-zoom-control />
          <ol-vector-layer>
            <ol-mouseposition-control />
            <ol-source-vector>
              <ol-interaction-draw @drawstart="marker_selector" type="Point" />
            </ol-source-vector>
          </ol-vector-layer>
        </ol-map>
        <button
          type="submit"
          :class="{
            'hover:bg-yellow-600/80': !loading,
          }"
          class="w-full flex text-lg justify-center items-center bg-yellow-600 text-white px-3 py-1.5 rounded-lg shadow-md"
          :disabled="loading"
        >
          <span v-if="!loading" class="h-6"> Register </span>
          <span v-else>
            <svg
              class="w-6 h-6 animate-spin text-yellow-600 fill-white"
              viewBox="0 0 100 101"
              fill="none"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </span>
        </button>
      </form>
    </div>
  </div>
</template>
