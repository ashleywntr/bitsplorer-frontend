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
      <b-col>
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
            <b-button :disabled="api_busy" class="btn" variant="primary" @click="address_populator(address_entry)">
              <b-spinner v-if="api_busy" small></b-spinner>
              <b-icon-search></b-icon-search>
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row class="mb-4" v-if="this.$cookies.get('previous_address_searches')">
      <b-col>
        <b-input-group prepend="Previous Searches" size="lg">
          <b-form-select v-model="previous_address_search_selection"
                         :disabled="api_busy"
                         :options="previous_address_search_selection_options">
          </b-form-select>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row v-if="address_table_array" class="mt-5">
      <b-col v-for="entry in address_table_array" :key="entry._id">
        <b-card :key="entry._id" :id="entry._id">

          <template #header class="mb-0">
            <b-row>
              <b-col class="d-flex">
                <div>
                  <h4>{{ entry._id }}</h4>
                </div>
                <div class="ml-auto">
                  <b-button @click="address_remover(entry._id)" variant="outline-danger"><strong>X</strong></b-button>
                </div>
              </b-col>
            </b-row>
          </template>

          <b-card-body>
            <b-row v-if="entry.abuse_count">
              <b-col>
                <b-alert dismissible :show="true" variant="danger">BitcoinAbuse: Malicious Activity Identified for this address
                  <a :href="'https://www.bitcoinabuse.com/reports/'+entry._id" target="_blank">
                    ({{ entry.abuse_count > 1 ? entry.abuse_count + ' instances' : entry.abuse_count + ' instance' }})</a>
                </b-alert>
              </b-col>
            </b-row>

            <b-row v-if="!entry.abuse_count">
              <b-col>
                <b-alert dismissible :show="true" variant="success">BitcoinAbuse: No Malicious Activity Identified for this
                  address
                </b-alert>
              </b-col>
            </b-row>

            <b-row v-if="!entry.abuse_check">
              <b-col>
                <b-alert dismissable :show="true" variant="warning">Failed to retrieve abuse report</b-alert>
              </b-col>
            </b-row>

            <b-row>
              <b-col>
                <b-row>
                  <b-table :fields="address_table_fields"
                           :items="[entry]"
                           class="pl-2 pr-2"
                           :responsive="true"
                           sticky-header="85vh">
                  </b-table>
                </b-row>
              </b-col>
            </b-row>

            <b-row v-if="!entry.transaction_data">
              <b-col>
                <b-button class="btn btn-primary btn-block" @click="transaction_populator(entry._id)">
                  <b-spinner v-if="api_busy" small></b-spinner>
                  Load Additional Data
                </b-button>
              </b-col>
            </b-row>

            <b-row v-if="entry.transaction_data" class="">
              <b-col>
                <b-table :fields="transaction_table_fields"
                         :items="entry.transaction_data"
                         :sort-by.sync="transaction_table_sort_by"
                         :sort-desc="true"
                         :bordered="true"
                         class="pl-2 pr-2"
                         :responsive="true"
                         sticky-header="55vh">

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
                          <b-table-simple v-if="!row.item.coinbase_transaction" :responsive="true" :stacked="true">
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
                                <b-td stacked-heading="Address">
                                  <a :href="'#'+output.addr" @click="address_populator(output.addr)">{{
                                      output.addr
                                    }}</a></b-td>
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
          </b-card-body>
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
date.setDate(date.getDate() - 3)
let date_string = date.toISOString().slice(0, 10)


export default {
  name: "AddressExplorer",
  data() {
    return {
      address_entry: null,
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
      api_busy: false,
      address_table_array: [],

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

      transaction_table_sort_by: 'time',
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
        {
          key: "time", label: "Date", sortable: true, formatter: (value) => {
            return new Date(value * 1000).toLocaleDateString('en-GB')
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
    document.title = this.$route.name + this.$root.title_brand
    this.currency_value_retriever()
    if (this.$cookies.get('previous_address_searches')) {
      this.address_main_search_history_cookie()
    }
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
    address_importer: function (address) {
      this.address_main_search_history_cookie()
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
            this.makeToast('danger', 'Address Import Error', error)
            console.log(error)
          })

    },
    transaction_table_importer: function (address) {
      let transaction_retrieval_url = `${this.$root.api_combined_address}/address/transactions?hash=${address}`
      let return_list = []
      console.log("Retrieving Extra Address Transaction Data from ", transaction_retrieval_url)
      axios
          .get(transaction_retrieval_url)
          .then(response => {
            let working_index = 0
            return_list = response.data['txs']
            console.log(return_list)
            this.address_table_array.forEach((entry, i) => {
              if (entry._id === address) {
                working_index = i
              }
            })
            let target = this.address_table_array[working_index]
            target.transaction_data = return_list
            this.$set(this.address_table_array, working_index, target)
            console.log('Working Index', working_index)
            console.log('Extra data', this.address_table_array)
          })
          .catch(error => {
            this.makeToast('danger', 'Address Transaction Import Error', error)
            console.log(error)
          })
    },

    address_populator: function (address) {
      this.address_entry = null
      console.log(address)
      let allow_import = true
      this.address_table_array.forEach((entry) => {
        if (entry._id === address) {
          console.log("Duplicate import prevented")
          this.makeToast('warning', 'Duplicate Import Prevented', `${address} has already been imported.`)
          allow_import = false
        }
      })
      if (allow_import) {
        this.address_importer(address)
      }
    },
    transaction_populator: function (address) {
      console.log("Retrieving Tx for ", address)
      this.transaction_table_importer(address)
    },
    address_remover: function (address) {
      this.address_table_array.forEach((entry, index) => {
        if (entry._id === address) {
          this.$delete(this.address_table_array, index)
        }
      })
    },

    address_main_search_history_cookie() {
      let previous_address_searches = []
      let current_time = new Date()

      if (this.$cookies.get('previous_address_searches')) {
        console.log('Address Explorer retrieving searches from cookie')
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
        {value: null, text: 'Select Address'}
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

        if (currency_value.toFixed(toFixed) > 0) {
          fixed_value = currency_value.toFixed(toFixed)
        } else {
          fixed_value = currency_value.toFixed(6)
        }
        if (this.currency_chosen_value === 'USD') {
          return USD_formatter.format(fixed_value)
        } else if (this.currency_chosen_value === 'GBP') {
          return GBP_formatter.format(fixed_value)
        } else if (this.currency_chosen_value === 'EUR') {
          return EUR_formatter.format(fixed_value)
        } else if (this.currency_chosen_value === 'CNY') {
          return CNY_formatter.format(fixed_value)
        }
      }
    },
  },
  watch: {
    previous_address_search_selection: function (selection) {
      this.address_entry = selection['address']
    },
  },

}
</script>

<style scoped>

</style>
