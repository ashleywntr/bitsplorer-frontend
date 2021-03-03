<template>
  <b-container class="pb-3">
    <b-row class="pt-3">
      <b-col>
        <h1>
          <strong>Address Explorer</strong>
        </h1>
      </b-col>
    </b-row>

    <b-row class="mb-4">
      <b-col >
        <b-input-group prepend="Currency" size="lg">
          <b-form-select v-model="currency_chosen_value"
                         :disabled="api_busy"
                         :options="currency_options"
          >
          </b-form-select>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row class="mt-3 pb-3">
      <b-col>
        <b-input-group prepend="Address Hash" size="lg">
          <b-form-input id="address-form-input"
                        v-model="address_entry"
                        placeholder="33i1YrAZ6y6xfkK819zd7CXup4NMXAPB1C"
                        type="search"
                        trim>
          </b-form-input>
          <b-input-group-append>
            <b-button :disabled="api_busy" class="btn" variant="primary" @click="address_importer(address_entry)">
              <b-spinner v-if="api_busy" small></b-spinner>
              Submit
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row class="mt-4 mb-4" v-if="this.$cookies.get('previous_address_searches')">
      <b-col >
        <b-input-group prepend="Previous Searches" size="lg">
          <b-form-select v-model="previous_address_search_selection"
                         :disabled="api_busy"
                         :options="previous_address_search_selection_options">
          </b-form-select>
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
        <b-row v-if="!transaction_data">
          <b-col>
            <b-button class="btn btn-primary btn-block" @click="transaction_table_importer(address_entry)" >
              <b-spinner v-if="api_busy" small></b-spinner>
              Load Additional Data</b-button>
          </b-col>
        </b-row>

        <b-row v-if="transaction_data" class="">
          <b-col>
            <b-table :busy="transaction_table_busy"
                     :fields="transaction_table_fields"
                     :items="transaction_data"
                     :sort-by.sync="transaction_table_sort_by"
                     :sort-desc="true"
                     bordered
                     class="pl-2 pr-2"
                     responsive
                     sticky-header="55vh">

              <template #table-busy>
                <div class="text-danger d-flex flex-column align-items-center justify-content-center">
                  <b-spinner class="pt-2" style="width: 7rem; height: 7rem;"></b-spinner>
                  <span class="pt-2">{{ transaction_table_import_progress }}</span>
                </div>
              </template>

              <template #cell(show_details)="row">
                <b-button block class="mr-2" size="sm" @click="row.toggleDetails">
                  {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
                </b-button>
              </template>

              <template #row-details="row">
                <b-card>
                  <b-row>
                    <b-col>
                      <h3>Transaction Details</h3>
                    </b-col>
                  </b-row>
                  <b-row>
                    <b-col>
                      <h3 v-if="!row.item.coinbase_transaction">Inputs</h3>
                      <h3 v-if="row.item.coinbase_transaction">Coinbase Transaction</h3>
                      <b-table-simple v-if="!row.item.coinbase_transaction" responsive stacked>
                        <b-thead>
                          <b-tr>
                            <b-th>Inputs</b-th>
                          </b-tr>
                          <b-tr>
                            <b-th>Address</b-th>
                            <b-th>Value</b-th>
                          </b-tr>
                        </b-thead>
                        <b-tbody>
                          <b-tr v-for="input in row.item.inputs" :key="input.prev_out.addr">
                            <b-td stacked-heading="Value" v-text="currency_formatter(input.prev_out.value)"></b-td>
                            <b-td stacked-heading="Address">{{ input.prev_out.addr }}</b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                    </b-col>

                    <b-col>
                      <h3>Outputs</h3>
                      <b-table-simple responsive stacked>
                        <b-thead>
                          <b-tr>
                            <b-th>Outputs</b-th>
                          </b-tr>
                          <b-tr>
                            <b-th>Address</b-th>
                            <b-th>Value</b-th>
                            <b-th>Output Order</b-th>
                          </b-tr>
                        </b-thead>
                        <b-tbody>
                          <b-tr v-for="output in row.item.out" :key="output.addr">
                            <b-td stacked-heading="Value" v-text="currency_formatter(output.value)"></b-td>
                            <b-td stacked-heading="Address"><a href="#" @click="extra_address_populator(output.addr)">{{ output.addr }}</a></b-td>
                            <b-td stacked-heading="Spent">{{ output.spent }}</b-td>
                            <b-td stacked-heading="Output Order">{{ output.n }}</b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                    </b-col>
                  </b-row>

                  <b-row>
                    <b-col>
                      <span>Transaction Hash {{ row.item._id }}</span>
                    </b-col>
                  </b-row>
                </b-card>
              </template>
            </b-table>
          </b-col>
        </b-row>
      </b-card>
    </b-row>

    <b-row v-if="address_table_array" class="mt-5">
      <b-col v-for="entry in address_table_array" :key="entry._id">
        <b-card :title="entry._id" :key="entry._id">

          <b-row v-if="entry.abuse_count">
            <b-col>
              <b-alert dismissible show variant="danger">BitcoinAbuse: Malicious Activity Identified for this address
                ({{ entry.abuse_count }} instances)
              </b-alert>
            </b-col>
          </b-row>

          <b-row v-if="!entry.abuse_count">
            <b-col>
              <b-alert dismissible show variant="success">BitcoinAbuse: No Malicious Activity Identified for this address
              </b-alert>
            </b-col>
          </b-row>

          <b-row v-if="!entry.abuse_check">
            <b-col>
              <b-alert dismissable show variant="warning">Failed to retrieve abuse report</b-alert>
            </b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-row>
                <b-table :busy="address_table_busy"
                         :fields="address_table_fields"
                         :items="[entry]"
                         class="pl-2 pr-2"
                         responsive
                         sticky-header="85vh">
                </b-table>
              </b-row>
            </b-col>
          </b-row>

          <b-row v-if="!entry.transaction_data">
            <b-col>
              <b-button class="btn btn-primary btn-block" @click="extra_address_transaction_populator(entry._id)" >
                <b-spinner v-if="api_busy" small></b-spinner>
                Load Additional Data</b-button>
            </b-col>
          </b-row>

          <b-row v-if="entry.transaction_data" class="">
            <b-col>
              <b-table :busy="transaction_table_busy"
                       :fields="transaction_table_fields"
                       :items="entry.transaction_data"
                       :sort-by.sync="transaction_table_sort_by"
                       :sort-desc="true"
                       bordered
                       class="pl-2 pr-2"
                       responsive
                       sticky-header="55vh">

                <template #table-busy>
                  <div class="text-danger d-flex flex-column align-items-center justify-content-center">
                    <b-spinner class="pt-2" style="width: 7rem; height: 7rem;"></b-spinner>
                    <span class="pt-2">{{ transaction_table_import_progress }}</span>
                  </div>
                </template>

                <template #cell(show_details)="row">
                  <b-button block class="mr-2" size="sm" @click="row.toggleDetails">
                    {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
                  </b-button>
                </template>

                <template #row-details="row">
                  <b-card>
                    <b-row>
                      <b-col>
                        <h3>Transaction Details</h3>
                      </b-col>
                    </b-row>
                    <b-row>
                      <b-col>
                        <h3 v-if="!row.item.coinbase_transaction">Inputs</h3>
                        <h3 v-if="row.item.coinbase_transaction">Coinbase Transaction</h3>
                        <b-table-simple v-if="!row.item.coinbase_transaction" responsive stacked>
                          <b-thead>
                            <b-tr>
                              <b-th>Inputs</b-th>
                            </b-tr>
                            <b-tr>
                              <b-th>Address</b-th>
                              <b-th>Value</b-th>
                            </b-tr>
                          </b-thead>
                          <b-tbody>
                            <b-tr v-for="input in row.item.inputs" :key="input.prev_out.addr">
                              <b-td stacked-heading="Value" v-text="currency_formatter(input.prev_out.value)"></b-td>
                              <b-td stacked-heading="Address">{{ input.prev_out.addr }}</b-td>
                            </b-tr>
                          </b-tbody>
                        </b-table-simple>
                      </b-col>

                      <b-col>
                        <h3>Outputs</h3>
                        <b-table-simple responsive stacked>
                          <b-thead>
                            <b-tr>
                              <b-th>Outputs</b-th>
                            </b-tr>
                            <b-tr>
                              <b-th>Address</b-th>
                              <b-th>Value</b-th>
                              <b-th>Output Order</b-th>
                            </b-tr>
                          </b-thead>
                          <b-tbody>
                            <b-tr v-for="output in row.item.out" :key="output.addr">
                              <b-td stacked-heading="Value" v-text="currency_formatter(output.value)"></b-td>
                              <b-td stacked-heading="Address"><a href="#" @click="extra_address_populator(output.addr)">{{ output.addr }}</a></b-td>
                              <b-td stacked-heading="Spent">{{ output.spent }}</b-td>
                              <b-td stacked-heading="Output Order">{{ output.n }}</b-td>
                            </b-tr>
                          </b-tbody>
                        </b-table-simple>
                      </b-col>
                    </b-row>

                    <b-row>
                      <b-col>
                        <span>Transaction Hash {{ row.item._id }}</span>
                      </b-col>
                    </b-row>
                  </b-card>
                </template>
              </b-table>
            </b-col>
          </b-row>
        </b-card>
      </b-col>
    </b-row>

  </b-container>
</template>

<script>
import axios from "axios";

const USD_formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const GBP_formatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP'
})

const EUR_formatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'EUR'
})

const CNY_formatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'CNY'
})
let date = new Date()
date.setDate(date.getDate()-1)
let date_string = date.toISOString().slice(0,10)


export default {
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

      address_table_array: [],

      failed_error_message: null,
      currency_chosen_value: 'XBP',
      currency_options: [
        {value: 'XBP', text: '₿ XBP'},
        {value: 'USD', text: '$ USD'},
        {value: 'GBP', text: '£ GBP'},
        {value: 'EUR', text: '€ EUR'},
        {value: 'CNY', text: '¥ CNY'}
      ],
      currency_data: [],

      previous_address_search_selection: null,
      previous_address_search_selection_options: null,

      transaction_data: null,
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
        {key: "time", label: "Date", sortable: true, formatter: (value)=> {
            return new Date(value * 1000).toLocaleDateString('en-GB')
          }},
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
    this.currency_value_retriever()
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
    address_importer: function (address, extra) {
      this.history_cookies()
      if (!extra) {
        this.api_busy = true
        this.table_failed = false

        this.address_table = null
        let url = `${this.$root.api_combined_address}/address?hash=${address}`
        console.log("Retrieving Address Data from", url)
        axios
            .get(url)
            .then(response => {
              console.log('Address Response Received')
              this.address_table = [response.data]
              this.address_abuse_retrieval = response.data.abuse_check
              this.address_abuse_count = response.data.abuse_count
              this.api_busy = false
              console.log("Address Data Retrieval Complete")
            })
            .catch(error => {
              this.failed_error_message = error
              this.makeToast('danger', 'Address Import Error', error)
              console.log(error)
            })
      }
      else{
        let url = `${this.$root.api_combined_address}/address?hash=${address}`
        console.log("Retrieving Extra Address Data from", url)
        let return_object = {}
        axios
            .get(url)
            .then(response => {
              console.log('Address Response Received')
              return_object = response.data
              this.api_busy = false
              console.log("Extra Address Data Retrieval Complete")
              console.log(return_object)
              this.address_table_array.push(return_object)
            })
            .catch(error => {
              this.failed_error_message = error
              this.makeToast('danger', 'Address Import Error', error)
              console.log(error)
            })
      }
    },
    transaction_table_importer: function(address, extra){
      if (!extra) {
        this.api_busy = true
        this.transaction_table_busy = true
        let transaction_retrieval_url = `${this.$root.api_combined_address}/address/transactions?hash=${address}`
        console.log("Retrieving Address Transaction Data from ", transaction_retrieval_url)
        axios
            .get(transaction_retrieval_url)
            .then(response => {
              this.transaction_data = response.data['txs']
              this.api_busy = false
              this.transaction_table_busy = false
            })
            .catch(error => {
              this.failed_error_message = error
              this.makeToast('danger', 'Address Transaction Import Error', error)
              console.log(error)
            })
      }
      else{
        let transaction_retrieval_url = `${this.$root.api_combined_address}/address/transactions?hash=${address}`
        let return_list = []
        console.log("Retrieving Extra Address Transaction Data from ", transaction_retrieval_url)
        axios
            .get(transaction_retrieval_url)
            .then(response => {
              return_list = response.data['txs']
              console.log(return_list)
            })
            .catch(error => {
              this.failed_error_message = error
              this.makeToast('danger', 'Address Transaction Import Error', error)
              console.log(error)
            })
      }
    },

    extra_address_populator: function (address) {
      console.log(address)
      this.address_importer(address, true)
    },
    extra_address_transaction_populator: function (address){
      console.log("Retrieving Tx for ", address)
      this.transaction_table_importer(address, true)
    },


    history_cookies() {
      let previous_address_searches = []
      let current_time = new Date()

      if (this.$cookies.get('previous_address_searches')) {
        previous_address_searches = JSON.parse(this.$cookies.get('previous_address_searches'))
      }
      if (this.address_entry) {
        previous_address_searches.push({
          address: this.address_entry,
          request_date: current_time
        })
        let previous_address_searches_string = JSON.stringify(previous_address_searches)
        this.$cookies.set("previous_address_searches", previous_address_searches_string)
      }
      previous_address_searches.sort(function (a, b) {
        return new Date(b['request_date']) - new Date(a['request_date'])
      })
      let filtered_searches = []
      for (let x in previous_address_searches) {
        let in_list = false
        for (let search in filtered_searches) {
          if (previous_address_searches[x].address === filtered_searches[search].address) {
            in_list = true
          }
        }
        if (!in_list) {
          filtered_searches.push(previous_address_searches[x])
        }
      }

      this.previous_address_search_selection_options = [
        {value: null, text: 'Select Search'}
      ]

      for (let x in filtered_searches) {
        this.previous_address_search_selection_options.push(
            {
              value: filtered_searches[x],
              text: `${filtered_searches[x]['address']}`
            })
      }
    },

    currency_value_retriever: function () {

      console.log(date_string)
      let currency_retrieval_url = `${this.$root.api_combined_address}/currency?date_from=${date_string}&date_to=${date_string}`
      console.log('Currency Retrieval', currency_retrieval_url)
      axios.get(currency_retrieval_url)
          .then(results => {
            console.log(results)
            this.currency_data = results.data
          })
          .catch(error => {
            console.log('Transaction Retrieval Error:', error)
          })
    },

    currency_formatter: function (input, key, item, toFixed = 2) {
      if (this.currency_chosen_value === 'XBP') {
        if ((input / 100000000).toFixed(2) > 0) {
          return '₿' + ((input / 100000000).toFixed(toFixed)).toLocaleString('en-GB')
        } else {
          return '₿' + ((input / 100000000).toFixed(6)).toLocaleString('en-GB')
        }
      } else {
        let sat_to_btc = input / 100000000

        let selected_base = this.currency_data[date_string][this.currency_chosen_value]
        let currency_value = (sat_to_btc * selected_base)
        let fixed_value = 0

        if (currency_value.toFixed(toFixed) > 0){
          fixed_value = currency_value.toFixed(toFixed)
        } else {
          fixed_value = currency_value.toFixed(6)
        }
        if (this.currency_chosen_value === 'USD'){
          return USD_formatter.format(fixed_value)
        }else if (this.currency_chosen_value === 'GBP'){
          return GBP_formatter.format(fixed_value)
        }
        else if (this.currency_chosen_value === 'EUR'){
          return EUR_formatter.format(fixed_value)
        }
        else if (this.currency_chosen_value === 'CNY'){
          return CNY_formatter.format(fixed_value)
        }
      }
    },
  },
  watch:{
    previous_address_search_selection: function (selection){
      this.address_entry = selection['address']

    },
    mounted(){
      if (this.$cookies.get('previous_address_searches')) {
        this.history_cookies()
      }
    },
  }

}
</script>

<style scoped>

</style>
