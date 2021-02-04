<template>
  <b-container class="pb-3">
    <b-row class="pt-3">
      <b-col>
        <h1>
          <strong>Address Explorer</strong>
        </h1>
      </b-col>
    </b-row>

    <b-row class="mt-3 pb-3">
      <b-col>
        <b-input-group prepend="Address Hash" size="lg">
          <b-form-input id="address-form-input"
                        v-model="address_entry"
                        placeholder="33i1YrAZ6y6xfkK819zd7CXup4NMXAPB1C"
                        type="search">
          </b-form-input>
          <b-input-group-append>
            <b-button :disabled="api_busy" class="btn" variant="primary" @click="address_importer">Submit</b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row v-if="address_table" class="justify-content-center mt-2">
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

        <b-row v-if="address_table">
          <b-col>
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
                       sticky-header="85vh">
              </b-table>
            </b-row>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-button class="btn btn-primary btn-block" >Load Additional Data</b-button>
          </b-col>
        </b-row>
      </b-card>
    </b-row>
  </b-container>
</template>

<script>
import axios from "axios";
import currency_formatter from "@/currency_formatter";
export default {
  extends: currency_formatter,
  name: "AddressExplorer",
  data() {
    return {
      address_entry: null,
      address_table_busy: false,
      address_table_fields: [
        {key: 'n_tx', label: 'Total TXs'},
        {
          key: 'total_received',
          label: 'Total Received',
          formatter: (value, key, item) => this.currency_formatter(value, key, item)
        },
        {
          key: 'total_sent',
          label: 'Total Sent',
          formatter: (value, key, item) => this.currency_formatter(value, key, item)
        },
        {
          key: 'final_balance',
          label: 'Final Balance',
          formatter: (value, key, item) => this.currency_formatter(value, key, item)
        },
      ],
      address_table: null,
      working_address: null,
      api_busy: false,
      address_table_sort_by: null,

      address_abuse_retrieval: false,
      address_abuse_count: 0,
      abuse_failed: false,

      address_transaction_data: null,

      table_failed: false,
      failed_error_message: null,
      currency_chosen_value: 'XBP',

      transaction_table: null,
      block_selected: false,
      transaction_table_sort_by: 'time',
      transaction_csv_data_link: "",
      transaction_table_busy: true,
      transaction_table_import_progress: "",
      transaction_table_fields: [
        {
          key: "coinbase_transaction", label: "", sortable: true, formatter: value => {
            if (value === true) {
              return "Coinbase Transaction"
            } else {
              return ""
            }
          }
        },
        {key: "vin_sz", label: "No. Inputs", sortable: true},
        {key: "vout_sz", label: "No. Outputs", sortable: true},
        {
          key: "value_inputs",
          label: "Total Val. Inputs",
          sortable: true,
          formatter: (value, key, item) => this.currency_formatter(value, key, item)
        },
        {
          key: "fee",
          label: "Fee",
          sortable: true,
          formatter: (value, key, item) => this.currency_formatter(value, key, item, 6)
        },
        {
          key: "value_outputs",
          label: "Total Val. Outputs",
          sortable: true,
          formatter: value => this.currency_formatter(value)
        },
        {key: "show_details", label: ""}
      ]

    }
  },
  mounted() {
    document.title = "Address Explorer | py-chain"
  },
  methods: {
    makeToast: function (variant = null, title = null, body = null, auto_hide = true) {
      this.$bvToast.toast(`${body}`, {
        title: `${title}`,
        variant: variant,
        solid: true,
        noAutoHide: !auto_hide
      })
    },
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
            this.makeToast('danger', 'Address Import Error', error)
            console.log(error)
          })
    },
  }

}
</script>

<style scoped>

</style>
