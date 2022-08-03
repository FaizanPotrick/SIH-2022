import { defineStore } from "pinia";
import axios from "axios";
import useAlertStore from "../Alert";
import useValidationStore from "../Validation";
const { open_alert_box, isAlert_text } = useAlertStore();

export default defineStore({
  id: "miner_registration",
  state: () => ({
    organization_id: "",
    manager_name: {
      value: "",
      valid: true,
      regex: /^([ a-zA-Z]+)$/,
      message: "Name must be alphabetic",
    },
    manager_email_address: {
      value: "",
      valid: true,
      regex: /^[a-zA-Z]([a-zA-Z0-9_.]+)@([a-zA-Z0-9]+)\.([a-zA-Z]){2,6}$/,
      message: "Enter a valid email address",
    },
    manager_phone_no: {
      value: "",
      valid: true,
      regex: /^([0-9]+)$/,
      message: "Phone number must be numeric",
    },
    manager_aadhar_card: {
      value: "",
      valid: true,
      regex: /^([0-9]+)$/,
      message: "Aadhar card must be numeric",
    },
    mine_pin_code: {
      value: "",
      valid: true,
      regex: /^([0-9]+)$/,
      message: "Pin Code must be Valid",
    },
    mine_area: {
      value: 0,
      valid: true,
      regex: /^((?!(0))[0-9]+)$/,
      message: "It must be a positive number",
    },
    mine_warehouse_capacity: {
      value: 0,
      valid: true,
      regex: /^((?!(0))[0-9]+)$/,
      message: "It must be a positive number",
    },
    lease_period: {
      value: 0,
      valid: true,
      regex: /^((?!(0))[0-9]+)$/,
      message: "It must be a positive number",
    },
    center: {
      lat: 20.5937,
      lng: 78.9629,
    },
    zoom: 4,
    coordinates: {
      lat: 0,
      lng: 0,
    },
  }),
  actions: {
    marker_selector(e) {
      this.coordinates = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
    },
    async register_fn() {
      if (
        !this.manager_name.valid ||
        !this.manager_email_address.valid ||
        !this.manager_phone_no.valid ||
        !this.manager_aadhar_card.valid ||
        !this.mine_pin_code.valid ||
        this.mine_area.value <= 0 ||
        !this.mine_area.valid ||
        !this.mine_warehouse_capacity.valid ||
        this.mine_warehouse_capacity.value <= 0 ||
        !this.lease_period.valid ||
        this.lease_period.value <= 0 ||
        this.coordinates.lat === 0 ||
        this.coordinates.lng === 0
      ) {
        isAlert_text(true);
        return;
      }
      isAlert_text(false);
      useValidationStore().isButtonLoading = true;
      await axios({
        method: 'post',
        url: '/api/registration/mine',
        data: {
          organization_id: this.organization_id,
          manager_name: this.manager_name.value,
          email_address: this.manager_email_address.value,
          phone_no: this.manager_phone_no.value,
          aadhar_card: this.manager_aadhar_card.value,
          pin_code: this.mine_pin_code.value,
          area: this.mine_area.value,
          warehouse_capacity: this.mine_warehouse_capacity.value,
          period: this.lease_period.value,
          coordinates: this.coordinates,
        }
      }).then(res => {
        open_alert_box(res.data.message, res.data.type);
        if (res.status === 200) {
          this.organization_id = "";
          this.manager_name.value = "";
          this.manager_email_address.value = "";
          this.manager_phone_no.value = "";
          this.manager_aadhar_card.value = "";
          this.mine_pin_code.value = "";
          this.mine_area.value = 0;
          this.mine_warehouse_capacity.value = 0;
          this.lease_period.value = 0;
          this.center = {
            lat: 20.5937,
            lng: 78.9629,
          };
          this.zoom = 4;
          this.coordinates = {
            lat: 0,
            lng: 0,
          };
        }
      }).catch(err => {
        open_alert_box(err.response.data.message);
      });
      useValidationStore().isButtonLoading = false;
    },
  },
});