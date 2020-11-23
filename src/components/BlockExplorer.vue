<template>
  <b-container class="p-3">
    <b-row>
      <b-col>
        <h1><strong>Block Explorer</strong></h1>
        <p>Choose a date range for which data should be imported. Where possible, data will be retrieved from the
          database.<br>New data will be acquired from the Blockchain API if necessary. This may take a while.</p>
      </b-col>
    </b-row>

    <b-row><!--Date Picker Row-->
      <b-col class="m-2" md="">

        <b-row>
          <b-col md="">
            <b-form-datepicker id="from_date_picker_block"
                               v-model="from_picker_date"
                               :disabled="from_picker_date_disabled || api_busy===true"
                               :max="from_picker_date_max_value"
                               :min="from_picker_date_min_value"
                               placeholder="Retrieval Range Start Date"
                               size="lg">
            </b-form-datepicker>
          </b-col>
          <b-col md="auto">
            <b-icon-arrow-right font-scale="3"></b-icon-arrow-right>
          </b-col>
          <b-col md="">
            <b-form-datepicker id="to_date_picker_block"
                               v-model="to_picker_date"
                               :disabled="to_picker_date_disabled || api_busy===true"
                               :max="to_picker_date_max_value"
                               :min="to_picker_date_min_value"
                               placeholder="Retrieval Range End Date"
                               size="lg">
            </b-form-datepicker>
          </b-col>
        </b-row>

        <b-row v-if="this.$cookies.get('previous_searches')">
          <b-col class="mt-2">
            <b-form-select v-model="previous_search_selection"
                           :disabled="api_busy"
                           :options="previous_search_selection_options">

            </b-form-select>
          </b-col>
        </b-row>

        <b-row>
          <b-col>
            <b-button :disabled="import_button_disabled || api_busy===true"
                      block class="mt-2"
                      variant="primary"
                      @click="blockday_axios_importer">Import Data
            </b-button>
          </b-col>
        </b-row>
      </b-col>
    </b-row>

    <b-row v-if="table_failed" class="m-1 d-flex flex-row align-items-center">
      <b-col>
        <h2 class="text-danger text-center">❌ {{ failed_error_message }}</h2>
      </b-col>
    </b-row>

    <!--BlockDay Table-->
    <b-row>
      <b-col v-if="date_selected && !table_failed">
        <b-table :busy="blockday_table_busy"
                 :fields="blockday_table_fields"
                 :items="blockday_table"
                 :sort-by.sync="blockday_table_sort_by"
                 class="p-2"
                 responsive
                 select-mode="single"
                 selectable
                 selected-variant="primary" @row-selected="on_blockday_table_row_selected">
          <template #table-busy>
            <div class="text-danger d-flex flex-column align-items-center justify-content-center">
              <b-spinner class="pt-2" style="width: 7rem; height: 7rem;"></b-spinner>
              <span class="pt-2">{{ blockday_table_import_progress }}</span>
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>

    <!--Block Table-->
    <b-row v-if="blockday_selected && !table_failed">
      <b-col>
        <h2><strong>Blocks on {{ slice_date_string(blockday_table_selection[0]['_id']) }}</strong></h2>
      </b-col>
    <b-col>
      <b-button block variant="outline-secondary" :disabled="block_table_busy || api_busy"  :href="block_csv_data_link"><b-icon-download></b-icon-download> Download .CSV</b-button>
    </b-col>
    </b-row>

    <b-row v-if="blockday_selected && !table_failed">
      <b-col class="">
        <b-row>
          <b-table :busy="block_table_busy"
                   :fields="block_table_fields"
                   :items="block_table"
                   :selectable="!api_busy"
                   :sort-by.sync="block_table_sort_by"
                   class="pl-2 pr-2"
                   responsive
                   select-mode="single"
                   selected-variant="primary"
                   sticky-header="85vh" @row-selected="on_block_table_row_selected">
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

    <!--Transaction Table-->
    <b-row v-if="blockday_selected && block_selected && !table_failed">
      <b-col class="">
        <h2><strong>Transactions for Block {{ block_Table_selection[0]['height'] }}</strong></h2>
      </b-col>
      <b-col>
        <b-button block variant="outline-secondary" :disabled="transaction_table_busy || api_busy" :href="transaction_csv_data_link"><b-icon-download></b-icon-download> Download .CSV</b-button>
      </b-col>
    </b-row>

    <b-row v-if="blockday_selected && block_selected && !table_failed">
      <b-col>
        <b-table :busy="transaction_table_busy"
                 :fields="transaction_table_fields"
                 :items="transaction_table"
                 :sort-by.sync="transaction_table_sort_by"
                 class="pl-2 pr-2"
                 responsive
                 :sort-desc="true"
                 sticky-header="85vh">

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
                        <b-td stacked-heading="Value" v-text="exported_sat_to_btc(input.prev_out.value)"></b-td>
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
                        <b-td stacked-heading="Value" v-text="exported_sat_to_btc(output.value)"></b-td>
                        <b-td stacked-heading="Address">{{ output.addr }}</b-td>
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

  </b-container>
</template>


<script>
import axios from "axios"
import Bottleneck from "bottleneck"

function sat_to_btc(value, to_fixed = 2) {
  if ((value / 100000000).toFixed(to_fixed) > 0) {
    return ((value / 100000000).toFixed(to_fixed)).toLocaleString('en-GB') + ' BTC'
  } else {
    return ((value / 100000000).toFixed(6)).toLocaleString('en-gb') + ' BTC'
  }
}

const limiter = new Bottleneck({
  minTime: 20
})

export default {
  name: "BlockExplorer",

  data() {
    const now = new Date
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const max_date = new Date(today)
    const first_bitcoin_block = new Date('2009-01-09')
    document.title = "test"
    return {

      previous_searches_exported: [],
      blockday_api_import: [],
      block_list_api_import: [],
      transaction_list_api_import: [],

      previous_search_selection: null,
      previous_search_selection_options: null,

      api_busy: false,

      from_picker_date_max_value: max_date,
      from_picker_date_min_value: first_bitcoin_block,
      from_picker_date_disabled: false,
      from_picker_date: null,

      to_picker_date_min_value: null,
      to_picker_date_max_value: max_date,
      to_picker_date_disabled: true,
      to_picker_date: null,

      table_failed: false,
      failed_error_message: null,

      import_button_disabled: true,

      date_selected: false,
      blockday_table_busy: false,
      blockday_table_import_progress: null,
      blockday_table: null,
      blockday_table_sort_by: '_id',
      blockday_table_selection: [],
      blockday_table_fields: [

        {
          key: '_id', label: 'Date', sortable: true, stickyColumn: true, isRowHeader: true, formatter: value => {
            return value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4)
          }
        },
        {key: "total_num_blocks", label: "Blocks", sortable: true},
        {
          key: "total_num_tx", label: "TXs.", sortable: true, formatter: value => {
            return value.toLocaleString('en-GB')
          }
        },
        {
          key: "avg_num_inputs", label: "Avg. No. Inputs", sortable: true, formatter: value => {
            return value.toFixed(2)
          }
        },
        {
          key: "avg_num_outputs", label: "Avg. No. Outputs", sortable: true, formatter: value => {
            return value.toFixed(2)
          }
        },

        {key: "avg_val_outputs", label: "Avg. TX Value", sortable: true, formatter: value => sat_to_btc(value)},
        {key: "total_val_fees_block", label: "Total Fees", sortable: true, formatter: value => sat_to_btc(value)},
        {key: "total_val_inputs", label: "Total Val. Inputs", sortable: true, formatter: value => sat_to_btc(value)},
        {key: "total_val_outputs", label: "Total Val. Outputs", sortable: true, formatter: value => sat_to_btc(value)},
        {
          key: "total_num_inputs", label: "Total No. Inputs", sortable: true, formatter: value => {
            return value.toLocaleString('en-GB')
          }
        },
        {
          key: "total_num_outputs", label: "Total No. Outputs", sortable: true, formatter: value => {
            return value.toLocaleString('en-GB')
          }
        }
      ],

      block_table: null,
      blockday_selected: false,
      block_table_sort_by: 'height',
      block_csv_data_link: "",
      block_table_busy: true,
      block_Table_selection: [],
      block_table_import_progress: "",
      block_table_fields: [
        {key: "height", sortable: true, stickyColumn: true, isRowHeader: true},
        {
          key: "n_tx", label: "TXs.", sortable: true, formatter: value => {
            return value.toLocaleString('en-GB')
          }
        },
        {
          key: "time", sortable: true, formatter: value => {
            return new Date(value * 1000).toLocaleTimeString('en-GB')
          }
        },
        {
          key: "average_num_inputs_per_transaction", label: "Avg. No. Inputs", sortable: true, formatter: value => {
            return value.toFixed(2)
          }
        },
        {
          key: "average_num_outputs_per_transaction", label: "Avg. No. Outputs", sortable: true, formatter: value => {
            return value.toFixed(2)
          }
        },

        {
          key: "average_val_outputs_per_transaction",
          label: "Avg. Transaction Value",
          sortable: true,
          formatter: value => sat_to_btc(value)
        },
        {
          key: "average_fee_per_transaction",
          label: "Avg. TX. Fee",
          sortable: true,
          formatter: value => sat_to_btc(value, 6)
        },
        {
          key: "total_num_inputs_block", label: "Total No. Inputs", sortable: true, formatter: value => {
            return value.toLocaleString('en-GB')
          }
        },
        {
          key: "total_num_outputs_block", label: "Total No. Outputs", sortable: true, formatter: value => {
            return value.toLocaleString('en-GB')
          }
        },
        {
          key: "total_val_inputs_block",
          label: "Total Val. Inputs",
          sortable: true,
          formatter: value => sat_to_btc(value)
        },
        {
          key: "total_val_outputs_block",
          label: "Total Val. Outputs",
          sortable: true,
          formatter: value => sat_to_btc(value)
        },
        {
          key: "total_val_fees_block", label: "Total Val. Fees", sortable: true, formatter: value => sat_to_btc(value)
        }
      ],

      transaction_table: null,
      block_selected: false,
      transaction_table_sort_by: 'coinbase_transaction',
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
        {key: "value_inputs", label: "Total Val. Inputs", sortable: true, formatter: value => sat_to_btc(value)},
        {key: "fee", label: "Fee", sortable: true, formatter: value => sat_to_btc(value, 6)},
        {key: "value_outputs", label: "Total Val. Outputs", sortable: true, formatter: value => sat_to_btc(value)},
        {key: "show_details", label: ""}
      ]
    }
  },
  watch: {
    from_picker_date: function (new_value) {
      console.log("From Date:", new_value)
      this.to_picker_date_min_value = new_value
      this.to_picker_date_disabled = false
      if (!this.to_picker_date || this.to_picker_date < this.from_picker_date) {
        this.to_picker_date = new_value
      }
    },
    to_picker_date: function (new_value) {
      console.log("To Date:", new_value)
      this.import_button_disabled = false
    },
    previous_search_selection: function (selection) {
      console.log(selection)
      this.from_picker_date = selection['from_date']
      this.to_picker_date = selection['to_date']
      this.to_picker_date = selection['to_date']
    }
  },

  methods: {
    blockday_axios_importer: function () {
      this.history_cookies()
      this.table_failed = false
      this.api_busy = true
      this.date_selected = true
      this.blockday_table_busy = true

      this.blockday_api_import = []
      this.blockday_table = []
      this.blockday_selected = false
      this.block_selected = false

      let blockday_base_url = `${this.$root.api_combined_address}/blockdays`
      console.log(blockday_base_url)

      let promise_list = []
      let url_list = []


      let from_date = new Date(this.from_picker_date)
      let to_date = new Date(this.to_picker_date)
      let working_date = new Date(from_date)

      while (working_date <= to_date) {
        url_list.push(blockday_base_url + '?date=' + working_date.toISOString().slice(0, 10))
        working_date.setDate(working_date.getDate() + 1)
      }
      console.log(url_list)

      for (let x in url_list) {
        promise_list.push(limiter.schedule(() => axios.get(url_list[x]))
            .then((results) => {
              this.blockday_api_import.push(results['data'])
              this.blockday_table_import_progress = `${this.blockday_api_import.length} / ${promise_list.length}`
              if (url_list.length === this.blockday_api_import.length) {
                this.blockday_table = this.blockday_api_import
                this.blockday_table_busy = false
                this.api_busy = false
              }
            })
            .catch(error => {
              this.table_failed = true
              this.failed_error_message = error
              this.api_busy = false
              console.log(error)
            })
        )
      }
    },
    history_cookies() {
      let previous_searches = []
      if (this.$cookies.get('previous_searches')) {
        previous_searches = JSON.parse(this.$cookies.get('previous_searches'))
      }

      if (this.from_picker_date && this.to_picker_date) {
        previous_searches.push({from_date: this.from_picker_date, to_date: this.to_picker_date})
        let previous_searches_string = JSON.stringify(previous_searches)
        this.$cookies.set("previous_searches", previous_searches_string)
      }

      // previous_searches.sort(function(a,b){
      //   console.log("Sorting")
      //   console.log(a['from_date'])
      //   console.log(b['from_date'])
      //   return new Date(b['from_date']) - new Date(a['from_date'])
      // })

      console.log(previous_searches)

      let filtered_searches = []
      for (let x in previous_searches) {
        let in_list = false
        for (let search in filtered_searches) {
          if (previous_searches[x].from_date === filtered_searches[search].from_date && previous_searches[x].to_date === filtered_searches[search].to_date) {
            in_list = true
            console.log('In List: ', in_list)
          }
        }
        if (!in_list) {
          filtered_searches.push(previous_searches[x])
        }
      }

      console.log(filtered_searches)

      this.previous_search_selection_options = [
        {value: null, text: 'Select a Previous Search'}
      ]

      for (let x in filtered_searches) {
        this.previous_search_selection_options.push(
            {
              value: filtered_searches[x],
              text: `${filtered_searches[x]['from_date']} --> ${filtered_searches[x]['to_date']}`
            })
      }
    },
    on_blockday_table_row_selected: function (items) {
      if (!(items.length === 0)) {
        this.blockday_selected = true
        this.blockday_table_selection = items
        this.block_csv_data_link = `${this.$root.api_combined_address}/csv/block?date=${Object.values(items)[0]['_id']}`
        let block_list = Object.values(items)[0]['blocks']
        this.block_list_axios_importer(block_list)

      } else {
        this.blockday_selected = false
      }
    },
    block_list_axios_importer: function (block_list) {
      console.log('Block List Importing')
      this.block_list_api_import = []
      this.block_table_busy = true
      let block_list_base_url = `${this.$root.api_combined_address}/block`
      let promise_list = []

      for (let x in block_list) {
        let block_list_combined_url = block_list_base_url + `?hash=${block_list[x]}`
        console.log(block_list_combined_url)
        promise_list.push(limiter.schedule(() => axios.get(block_list_combined_url))
            .then((results) => {
              this.block_list_api_import.push(results['data'])
              this.block_table_import_progress = `${this.block_list_api_import.length} / ${block_list.length}`
              if (block_list.length === this.block_list_api_import.length) {
                this.block_table = this.block_list_api_import
                this.block_table_busy = false
              }
            })
            .catch(error => {
              this.table_failed = "Failed"
              this.failed_error_message = error
              this.api_busy = false
              console.log(error)
            })
        )
      }
    },
    on_block_table_row_selected: function (items) {
      this.transaction_list_api_import = []
      if (!(items.length === 0)) {
        this.block_selected = true
        this.block_Table_selection = items
        let transaction_list = Object.values(items)[0]['tx']
        this.transaction_csv_data_link = `${this.$root.api_combined_address}/csv/transactions?hash=${Object.values(items)[0]['_id']}`
        this.transaction_list_axios_importer(transaction_list)
      } else {
        this.block_selected = false
      }
    },

    transaction_list_axios_importer: function (transaction_list) {
      this.api_busy = true
      this.transaction_table_busy = true
      let transaction_list_base_url = `${this.$root.api_combined_address}/transaction`

      for (let x in transaction_list) {
        let transaction_list_combined_url = transaction_list_base_url + `?hash=${transaction_list[x]}`
        limiter.schedule(() => axios.get(transaction_list_combined_url))
            .then((results) => {
              this.transaction_list_api_import.push(results['data'])
              this.transaction_table_import_progress = `${this.transaction_list_api_import.length} / ${transaction_list.length}`

              if (transaction_list.length === this.transaction_list_api_import.length) {
                this.transaction_table = this.transaction_list_api_import
                this.transaction_table_busy = false
                this.api_busy = false
              }
            })
            .catch(error => {
              this.table_failed = "Failed"
              this.api_busy = false
              this.failed_error_message = error
              console.log(error)
            })
      }
    },
    exported_sat_to_btc: function (input) {
      if ((input / 100000000).toFixed(2) > 0) {
        return ((input / 100000000).toFixed(2)).toLocaleString('en-GB') + ' BTC'
      } else {
        return ((input / 100000000).toFixed(6)).toLocaleString('en-GB') + ' BTC'
      }
    },
    slice_date_string: function (input) {
      return input.slice(0, 2) + '/' + input.slice(2, 4) + '/' + input.slice(4)
    },
    prevent_navigation: function (event) {
      if (!this.api_busy) return
      event.preventDefault()
      event.returnValue = ""
    }
  },
  beforeMount() {
    window.addEventListener("beforeunload", this.prevent_navigation)
  },
  mounted() {
    document.title = "Block Explorer | py-chain"
    if (this.$cookies.get('previous_searches')) {
      this.history_cookies()
    }
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.prevent_navigation)
  },
  beforeRouteLeave(to, from, next) {
    if (this.api_busy) {
      if (!window.confirm("An API request is in progress, are you sure you wish to exit?")) {
        return
      }
    }
    next()
  },
}
</script>

<style scoped>

</style>

