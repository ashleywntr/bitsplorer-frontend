<template>
  <b-container class="p-3">
    <b-row>
      <b-col>
        <h1><strong>Block Explorer</strong></h1>
        <b-alert class="warning" dismissible show>NOTE: Imports of non-cached data may be subject to rate-limiting
        </b-alert>
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

    <b-row class="mt-2 "><!--DAte Pickers-->
      <b-col xl="6" class="mb-2">
        <b-input-group prepend="From Date" size="lg">
          <b-form-datepicker id="from_date_picker_block"
                             v-model="from_picker_date"
                             :disabled="from_picker_date_disabled || api_busy===true"
                             :max="from_picker_date_max_value"
                             :min="from_picker_date_min_value"
                             placeholder="Select Date">
          </b-form-datepicker>
        </b-input-group>
      </b-col>
      <b-col xl="">
        <b-input-group prepend="To Date" size="lg">
          <b-form-datepicker id="to_date_picker_block"
                             v-model="to_picker_date"
                             :disabled="to_picker_date_disabled || api_busy===true"
                             :max="to_picker_date_max_value"
                             :min="to_picker_date_min_value"
                             placeholder="Select Date">
          </b-form-datepicker>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row class="mt-4 mb-4" v-if="this.$cookies.get('previous_searches')">
      <b-col >
        <b-input-group prepend="Previous Searches" size="lg">
          <b-form-select v-model="previous_search_selection"
                         :disabled="api_busy"
                         :options="previous_search_selection_options">
          </b-form-select>
        </b-input-group>
      </b-col>
    </b-row>

    <b-row class="mb-2">
      <b-col>
        <b-button :disabled="import_button_disabled || api_busy===true"
                  block class="mt-2"
                  variant="primary"
                  @click="import_button_click">Import Data
        </b-button>
      </b-col>
    </b-row>

    <b-row v-if="api_busy">
      <b-col>
      <span>
        <b-progress height="2rem" :max="blockday_table_import_max"  class="mb-3" show-value >
          <b-progress-bar :value="blockday_table_import_progress" variant="info" :label="`${(blockday_table_import_progress)} RETRIEVED`" ></b-progress-bar>
          <b-progress-bar :value="blockday_table_error_count" variant="danger" :label="`${(blockday_table_error_count)} / ${(blockday_table_import_max)} FAILED`" ></b-progress-bar>
          <b-progress-bar :value="future_blockday_import" variant="warning" :label="`${(future_blockday_import)} PENDING`" animated></b-progress-bar>
        </b-progress>
      </span>
      </b-col>
    </b-row>

    <!--    <b-row v-if="table_failed" class="m-1 d-flex flex-row align-items-center">-->
    <!--      <b-col>-->
    <!--        <h2 class="text-danger text-center">❌ {{ failed_error_message }}</h2>-->
    <!--      </b-col>-->
    <!--    </b-row>-->


    <!--BlockDay Table-->
    <b-row v-if="blockday_import_completed" class="pl-2 pr-2">
      <b-col>
        <b-table :busy="blockday_table_busy"
                 :fields="blockday_table_fields"
                 :items="blockday_table"
                 :sort-by.sync="blockday_table_sort_by"
                 bordered
                 class=""
                 hover
                 responsive
                 select-mode="single"
                 selectable
                 sticky-header="50vh"
                 selected-variant="primary" @row-selected="on_blockday_table_row_selected">
          <template #table-busy>
            <div class="text-danger d-flex flex-column align-items-center justify-content-center">
              <b-spinner class="pt-2" style="width: 7rem; height: 7rem;"></b-spinner>
              <span class="pt-2">{{ blockday_table_import_progress_string }}</span>
            </div>
          </template>
        </b-table>
      </b-col>
    </b-row>

    <!--Block Table-->
    <b-row v-if="blockday_selected && !table_failed" class="pl-2 pr-2">
      <b-col>
        <h2><strong>Blocks on {{ slice_date_string(blockday_table_selection[0]['_id']) }}</strong></h2>
      </b-col>
      <b-col>
        <b-button :disabled="block_table_busy || api_busy" :href="block_csv_data_link" block
                  variant="outline-secondary">
          <strong><b-icon-download></b-icon-download> Download .CSV</strong>
        </b-button>
      </b-col>
    </b-row>

    <b-row v-if="blockday_selected && !table_failed" class="pl-4 pr-2">
      <b-col class="">
        <b-row>
          <b-table :busy="block_table_busy"
                   :fields="block_table_fields"
                   :items="block_table"
                   :selectable="!api_busy"
                   :sort-by.sync="block_table_sort_by"
                   bordered
                   class=""
                   hover
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
      <b-col>
        <h2><strong>Transactions for Block {{ block_table_selection[0]['height'] }}</strong></h2>
      </b-col>
      <b-col>
        <b-button :disabled="transaction_table_busy || api_busy" :href="transaction_csv_data_link" block hover
                  variant="outline-secondary">
          <b-icon-download></b-icon-download>
          Download .CSV
        </b-button>
      </b-col>
    </b-row>


    <b-row v-if="blockday_selected && block_selected && !table_failed">
      <b-col>
        <b-table :busy="transaction_table_busy"
                 :fields="transaction_table_fields"
                 :items="transaction_table"
                 :sort-by.sync="transaction_table_sort_by"
                 :sort-desc="true"
                 bordered
                 class="pl-2 pr-2"
                 responsive
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

const limiter = new Bottleneck({
  minTime: 20
})

export default {
  name: "BlockExplorer",

  props:{
    selected_currency:{
      type: String,
      required: true
    }

  },

  data() {
    const now = new Date
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const max_date = new Date(today)
    const first_bitcoin_block = new Date('2009-01-09')
    return {

      previous_searches_exported: [],
      blockday_api_import: [],
      block_list_api_import: [],
      transaction_list_api_import: [],

      previous_search_selection: null,
      previous_search_selection_options: null,

      currency_chosen_value: 'XBP',
      currency_options: [
        {value: 'XBP', text: '₿ XBP'},
        {value: 'USD', text: '$ USD'},
        {value: 'GBP', text: '£ GBP'},
        {value: 'EUR', text: '€ EUR'},
        {value: 'CNY', text: '¥ CNY'}
      ],
      working_currency_value: 0.0,
      working_date: '',
      currency_data: [],

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
      blockday_table_import_progress_string: null,
      blockday_table_import_progress: 0,
      blockday_table_import_max: null,
      blockday_table_error_count: 0,
      blockday_table_completed: false,

      blockday_table: null,
      blockday_table_sort_by: '_id',
      blockday_table_selection: [],
      blockday_selected_date: '',
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
        {
          key: "avg_val_outputs",
          label: "Avg. TX. Value",
          sortable: true,
          formatter: (value, key, item) => this.currency_formatter(value, key, item)
        },
        {
          key: "total_val_fees_block",
          label: "Total Fees",
          sortable: true,
          formatter: (value, key, item) => this.currency_formatter(value, key, item)
        },
        {
          key: "total_val_inputs",
          label: "Total Val. Inputs",
          sortable: true,
          formatter: (value, key, item) => this.currency_formatter(value, key, item)
        },
        {
          key: "total_val_outputs",
          label: "Total Val. Outputs",
          sortable: true,
          formatter: (value, key, item) => this.currency_formatter(value, key, item)
        },
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
      block_table_selection: [],
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
          formatter: value => this.currency_formatter(value)
        },
        {
          key: "average_fee_per_transaction",
          label: "Avg. TX. Fee",
          sortable: true,
          formatter: value => this.currency_formatter(value, 6)
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
          formatter: value => this.currency_formatter(value)
        },
        {
          key: "total_val_outputs_block",
          label: "Total Val. Outputs",
          sortable: true,
          formatter: value => this.currency_formatter(value)
        },
        {
          key: "total_val_fees_block",
          label: "Total Val. Fees",
          sortable: true,
          formatter: value => this.currency_formatter(value)
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
      this.from_picker_date = selection['from_date']
      this.to_picker_date = selection['to_date']
      this.to_picker_date = selection['to_date']
    }
  },
  computed:{
    future_blockday_import: function(){
      return (this.blockday_table_import_max - (this.blockday_table_import_progress+this.blockday_table_error_count))
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

    import_button_click: function () {
      this.history_cookies()
      this.blockday_axios_importer()

      this.previous_search_selection = null
    },
    blockday_axios_importer: function () {
      this.table_failed = false
      this.api_busy = true
      this.date_selected = true
      this.blockday_table_busy = true
      this.blockday_import_completed = false

      this.blockday_table_error_count = 0

      this.blockday_api_import = []
      this.blockday_table = []
      this.blockday_selected = false
      this.block_selected = false

      let blockday_base_url = `${this.$root.api_combined_address}/blockdays`

      let promise_list = []
      let url_list = []


      let from_date = new Date(this.from_picker_date)
      let to_date = new Date(this.to_picker_date)
      let working_date = new Date(from_date)

      while (working_date <= to_date) {
        url_list.push(blockday_base_url + '?date=' + working_date.toISOString().slice(0, 10))
        working_date.setDate(working_date.getDate() + 1)
      }
      console.log('BlockDay url list: ', url_list)
      this.blockday_table_import_progress_string = `0 / ${url_list.length}`
      this.blockday_table_import_max = url_list.length

      for (let x in url_list) {
        promise_list.push(limiter.schedule(() => axios.get(url_list[x]))
            .then((results) => {
              this.blockday_api_import.push(results['data'])
              this.blockday_table_import_progress = this.blockday_api_import.length
              this.blockday_table_import_progress_string = `${this.blockday_table_import_progress} / ${this.blockday_table_import_max}`
              console.log( 'Running total', (this.blockday_api_import.length + this.blockday_table_error_count))
            })
            .catch(error => {
              this.blockday_table_error_count += 1
              // this.table_failed = true
              // this.failed_error_message = error
              if (error.response) {
                // client received an error response (5xx, 4xx)
                let failed_date = error.response.config.url.slice(-10)
                this.makeToast('danger', `${failed_date}: BlockDay Import Failed`, ('Response Error: ' + error), false)
                console.log('BlockDay Retrieval Failure:', error.response.config.url.slice(-10))
              } else if (error.request) {
                this.makeToast('danger', `BlockDay Import Failed`, ('Request Error: ' + error))
                // client never received a response, or request never left
                this.api_busy = false
                this.table_failed = true
                console.log(error.request)
              } else {
                console.log('nothing received')
                // anything else
              }
            })
            .finally(()=>{
              if (url_list.length === (this.blockday_api_import.length + this.blockday_table_error_count)) {
                this.blockday_table = this.blockday_api_import
                this.blockday_import_completed = true
                this.blockday_table_busy = false
                this.api_busy = false
              }
        })
        )
      }
      if (url_list.length === (this.blockday_api_import.length + this.blockday_table_error_count)) {
        this.blockday_table = this.blockday_api_import
        this.blockday_table_busy = false
        this.api_busy = false
      }
      this.currency_value_retriever()
    },
    history_cookies() {
      let previous_searches = []
      let current_time = new Date()

      if (this.$cookies.get('previous_searches')) {
        previous_searches = JSON.parse(this.$cookies.get('previous_searches'))
      }
      if (this.from_picker_date && this.to_picker_date) {
        previous_searches.push({
          from_date: this.from_picker_date,
          to_date: this.to_picker_date,
          request_date: current_time
        })
        let previous_searches_string = JSON.stringify(previous_searches)
        this.$cookies.set("previous_searches", previous_searches_string)
      }
      previous_searches.sort(function (a, b) {
        return new Date(b['request_date']) - new Date(a['request_date'])
      })
      let filtered_searches = []
      for (let x in previous_searches) {
        let in_list = false
        for (let search in filtered_searches) {
          if (previous_searches[x].from_date === filtered_searches[search].from_date && previous_searches[x].to_date === filtered_searches[search].to_date) {
            in_list = true
          }
        }
        if (!in_list) {
          filtered_searches.push(previous_searches[x])
        }
      }

      this.previous_search_selection_options = [
        {value: null, text: 'Select Search'}
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
        this.blockday_selected_date = Object.values(items)[0]['_id']
        this.block_csv_data_link = `${this.$root.api_combined_address}/csv/block?date=${this.blockday_selected_date}`
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
        console.log('Block list combined url', block_list_combined_url)
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
              let status_code = error.response.status
              console.log('Block list importer error:', status_code)

              if (status_code === 404) {
                this.makeToast('warning', 'Block Data Missing', error, false)
                console.log("Data for Block missing")
              } else {
                this.makeToast('danger', 'Block Data Retrieval Failure', error, false)
                this.table_failed = "Failed"
                this.failed_error_message = error
              }
              this.api_busy = false
              console.log('Block retrieval error:', error.response)
            })
        )
      }
    },
    on_block_table_row_selected: function (items) {
      this.transaction_list_api_import = []
      if (!(items.length === 0)) {
        this.block_selected = true
        this.block_table_selection = items
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
              this.api_busy = false
              this.failed_error_message = error
              this.makeToast('danger', 'Transaction Retrieval Failure', error, false)
              console.log(error)
            })
      }
    },
    currency_value_retriever: function () {
      let currency_retrieval_url = `${this.$root.api_combined_address}/currency?date_from=${this.from_picker_date}&date_to=${this.to_picker_date}`
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

        let initial_date_string = ''

        if (this.blockday_selected) {
          initial_date_string = this.blockday_selected_date
        } else {
          initial_date_string = item._id
        }
        let retrieval_date_string = initial_date_string.slice(4) + '-' + initial_date_string.slice(2, 4) + '-' + initial_date_string.slice(0, 2)

        let selected_base = this.currency_data[retrieval_date_string][this.currency_chosen_value]
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

