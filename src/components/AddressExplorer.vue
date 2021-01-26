<template>
  <b-container>
    <b-row class="pt-3">
      <b-col>
        <h1>
          <strong>Address Explorer</strong>
        </h1>
      </b-col>
    </b-row>

    <b-row class="mt-3">
      <b-col>
        <b-input-group size="lg" prepend="Address Hash">
          <b-form-input id="address-form-input"
                           v-model="address_entry"
                           placeholder="33i1YrAZ6y6xfkK819zd7CXup4NMXAPB1C"
                            type="search">
          </b-form-input>
          <b-input-group-append>
            <b-button class="btn" variant="primary" @click="address_importer">Submit</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row v-if="table_failed" class="m-1 d-flex flex-row align-items-center">
      <b-col>
        <h2 class="text-danger text-center">❌ {{ failed_error_message }}</h2>
      </b-col>
    </b-row>

    <b-row class="justify-content-center mt-2" v-if="address_table">
      <b-card :title="address_table[0]._id">

    <b-row v-if="address_table && address_abuse_count">
      <b-col>
        <b-alert dismissible show variant="danger">BitcoinAbuse: Malicious Activity Identified for this address
          ({{ address_abuse_count }} instances)
        </b-alert>
      </b-col>
    </b-row>

    <b-row v-if="address_table && !address_abuse_count">
      <b-col>
        <b-alert dismissible show variant="success">BitcoinAbuse: No Malicious Activity Identified for this address
        </b-alert>
      </b-col>
    </b-row>

    <b-row v-if="address_table && abuse_failed">
      <b-col>
        <b-alert dismissable show variant="warning">Failed to retrieve abuse report</b-alert>
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
      </b-card>
    </b-row>

  </b-container>
</template>

<script>
import axios from "axios";

const USD_formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

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
      working_address: null,
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
    document.title = "Address Explorer | py-chain"
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

            this.address_abuse_retrieval = response.data.abuse_check
            this.address_abuse_count = response.data.abuse_count

            this.api_busy = false
          })
          .catch(error => {
            this.failed_error_message = error
            this.table_failed = true
            console.log(error)
          })
    },
    currency_formatter: function (input, key, item, toFixed = 2) {
      if (this.currency_chosen_value === 'XBP') {
        if ((input / 100000000).toFixed(2) > 0) {
          return '₿' + ((input / 100000000).toFixed(toFixed)).toLocaleString('en-GB')
        } else {
          return '₿' + ((input / 100000000).toFixed(toFixed)).toLocaleString('en-GB')
        }
      } else {
        let sat_to_btc = input / 100000000

        let initial_date_string = ''

        if (this.blockday_selected) {
          initial_date_string = this.blockday_selected_date
        } else {
          initial_date_string = item._id
        }
        let retrieval_date_string = initial_date_string.slice(4) + '-' + initial_date_string.slice(2, 4) + '-' + initial_date_string.slice(0, 2)

        let usd_value = this.currency_data[retrieval_date_string]['USD']
        let USD_value = (sat_to_btc * usd_value)
        let USD_fixed_value = 0

        if (USD_value.toFixed(toFixed) > 0) {
          USD_fixed_value = USD_value.toFixed(toFixed)
        } else {
          USD_fixed_value = USD_value.toFixed(6)
        }
        return USD_formatter.format(USD_fixed_value)
      }
    }

  }

}
</script>

<style scoped>

</style>
