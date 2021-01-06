<template>
  <b-container>
    <b-row class="pt-3">
      <b-col>
        <h1>
          <strong>Address Explorer</strong>
        </h1>
      </b-col>
    </b-row>

    <b-row>

      <b-col>
        <b-row class="h-25">
          <h2><label class="m-3" for="address-form-input">Wallet Address</label></h2>
        </b-row>
        <b-row>
          <b-input id="address-form-input" v-model="address_entry" class="m-3"
                   placeholder="Address Hash"></b-input>
        </b-row>
        <b-row>
          <b-button class="btn-block m-3" variant="primary" @click="address_importer">Submit</b-button>
        </b-row>
      </b-col>
    </b-row>

    <b-row v-if="table_failed" class="m-1 d-flex flex-row align-items-center">
      <b-col>
        <h2 class="text-danger text-center">❌ {{ failed_error_message }}</h2>
      </b-col>
    </b-row>

    <b-row v-if="address_table">
      <b-col>
        <h3>{{address_entry}}</h3>
      </b-col>
    </b-row>

    <b-row v-if="address_table && address_abuse_count">
      <b-col>
        <b-alert variant="danger" dismissable show>Malicious Activity Identified for this address ({{address_abuse_count}} instances)</b-alert>
      </b-col>
    </b-row>

    <b-row v-if="address_table && !address_abuse_count">
      <b-col>
        <b-alert variant="success" dismissable show>No Malicious Activity Identified for this address</b-alert>
      </b-col>
    </b-row>

    <b-row v-if="address_table && abuse_failed">
      <b-col>
        <b-alert variant="warning" dismissable show>Failed to retrieve abuse report</b-alert>
      </b-col>
    </b-row>

    <b-row v-if="!table_failed && address_table">
      <b-col class="">
        <b-row>
          <b-table :busy="address_table_busy"
                   :fields="address_table_fields"
                   :items="address_table"
                   :selectable="!api_busy"
                   :sort-by.sync="address_table_sort_by"
                   class="pl-2 pr-2"
                   responsive
                   select-mode="single"
                   selected-variant="primary"
                   sticky-header="85vh"
          >
            <template #table-busy>
              <div class="text-danger d-flex flex-column align-items-center justify-content-center">
                <b-spinner class="pt-2" style="width: 7rem; height: 7rem;"></b-spinner>
                <span class="pt-2">{{ block_table_import_progress }}</span>
              </div>
            </template>
          </b-table>
        </b-row>
      </b-col>
    </b-row>

  </b-container>
</template>

<script>
import axios from "axios";

export default {
  name: "AddressExplorer",
  data() {
    return {
      address_entry: null,
      address_table_busy: false,
      address_table_fields: [
        {key: 'n_tx', label: 'Total TXs'},
        {key: 'total_received', label: 'Total Received'},
        {key: 'total_sent', label: 'Total Sent'},
        {key: 'final_balance', label: 'Final Balance'},
      ],
      address_table: null,
      api_busy: false,
      address_table_sort_by: null,

      address_abuse_retrieval: false,
      address_abuse_count: 0,
      abuse_failed: false,

      table_failed: false,
      failed_error_message: null,
    }
  },
  mounted() {
  },
  methods: {
    address_importer: function () {
      this.api_busy = true
      this.table_failed = false

      this.address_table = null
      let url = `${this.$root.api_combined_address}/address?hash=${this.address_entry}`

      axios
          .get(url)
          .then(response => {
            console.log(response.data)
            this.address_table = [response.data]
            this.address_checker()
            this.api_busy = false
          })
          .catch(error => {
            this.failed_error_message = error
            this.table_failed = true
            console.log(error)
          })
    },
    address_checker: function (){
      this.abuse_failed = false
      this.address_abuse_retrieval = false
      let url = `https://www.bitcoinabuse.com/api/reports/check?address=${this.address_entry}&api_token=${this.$root.bitcoin_abuse_token}`
      axios
          .get(url)
          .then(response => {
            console.log(response.data)
            this.address_abuse_retrieval = true
            this.address_abuse_count = response.data.count
          })
          .catch(error => {
            this.failed_error_message = error
            this.abuse_failed = true
            console.log(error)
          })

    }
  }

}
</script>

<style scoped>

</style>
