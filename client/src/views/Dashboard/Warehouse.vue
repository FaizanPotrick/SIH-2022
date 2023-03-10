<script setup>
import { QrcodeStream } from "vue3-qrcode-reader";
import { ref } from "vue";
import axios from "axios";
import useAlertStore from "@/stores/Alert";

const { open_alert_box } = useAlertStore();
const errors = ref("");
const tested_mined_batch = ref([]);
const loading = ref(false);

const onInit = async (promise) => {
  try {
    await promise;
  } catch (error) {
    errors.value = error.name;
  }
};

const onDecode = async (result) => {
  const resultParse = await JSON.parse(result);
  const { status, data } = await axios.get(
    `/api/verify/tested_mined_batch?batch_id=${resultParse.batch_id}&batch_hash=${resultParse.batch_hash}`
  );
  if (status === 200) {
    tested_mined_batch.value = data;
  } else {
    open_alert_box(data.message, data.type);
  }
};

const register_fn = async () => {
  loading.value = true;
  try {
    await axios.get(
      `/api/registration/warehouse/tested_mined_batch?batch_id=${tested_mined_batch.value._id}`
    );
    window.location.reload();
  } catch (error) {
    open_alert_box(err.response.data.message, err.response.data.type);
  }
  loading.value = false;
};
</script>

<template>
  <div class="flex justify-center items-center min-h-[86vh] bg-yellow-50">
    <div
      class="max-w-lg w-full p-10 bg-white border shadow-md rounded-2xl text-gray-800 m-5 sm:m-10"
    >
      <div class="mb-4">
        <div class="font-semibold text-2xl text-yellow-700">
          Scan the QR Code
        </div>
        <div class="text-gray-500 text-sm">Tested Mined Batch</div>
      </div>
      <div class="my-5">
        {{ errors }}
      </div>
      <QrcodeStream @decode="onDecode" @init="onInit" />
      <table class="my-5 min-w-full text-gray-900">
        <tbody>
          <tr>
            <td class="mr-6 py-1 font-bold">Batch Id:</td>
            <td class="py-1">
              {{ tested_mined_batch._id }}
            </td>
          </tr>
          <tr>
            <td class="mr-6 py-1 font-bold">Manager Id:</td>
            <td class="py-1">
              {{ tested_mined_batch.manager_id }}
            </td>
          </tr>
          <tr>
            <td class="mr-6 py-1 font-bold">Grade:</td>
            <td class="py-1 capitalize">
              {{ tested_mined_batch.grade }}
            </td>
          </tr>
          <tr>
            <td class="mr-6 py-2 font-bold">Fe Percentage:</td>
            <td class="py-2">
              {{ tested_mined_batch.fe_percentage }}
            </td>
          </tr>
          <tr>
            <td class="mr-6 py-2 font-bold">Type of Ore:</td>
            <td class="py-1 capitalize">
              {{ tested_mined_batch.type_of_ore }}
            </td>
          </tr>
          <tr>
            <td class="mr-6 py-2 font-bold">Quantity:</td>
            <td class="py-1">
              {{ tested_mined_batch.quantity }}
            </td>
          </tr>
        </tbody>
      </table>
      <form class="space-y-5 drop-shadow-md" @submit.prevent="register_fn()">
        <button
          type="submit"
          :class="{
            'hover:bg-yellow-600/80': !loading,
          }"
          class="w-full flex text-lg justify-center items-center bg-yellow-600 text-white px-3 py-1.5 rounded-lg shadow-md"
          :disabled="loading"
        >
          <span v-if="!loading" class="h-6"> Approve </span>
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
<style></style>
