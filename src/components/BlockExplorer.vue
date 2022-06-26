<template>
  <div>
    <b-container class="p-3 mb-3">
      <b-row>
        <b-col>
          <h1><strong>Block Explorer</strong></h1>
          <b-alert class="warning" :dismissible="true" :show="true">NOTE: Imports of non-cached data may be subject to
            rate-limiting. Current cache consists of 2022-01-01 to present.
          </b-alert>
        </b-col>
      </b-row>

      <b-row class="mb-4"><!--Currency Picker-->
        <b-col>
          <b-input-group prepend="Currency" size="lg">
            <b-form-select v-model="currency_chosen_value"
                           :disabled="api_busy"
                           :options="currency_options"
            >
            </b-form-select>
            <b-input-group-append v-if="from_picker_date && to_picker_date">
              <b-button :href=currency_csv_download_url variant="outline-secondary" class="">
                <b-icon-download></b-icon-download>
                Currency Data (CSV)
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>
      <!--Date Pickers-->
      <b-row class="mt-2 ">
        <b-col class="mb-2" xl="6">
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

      <b-row class="mt-2 mb-4">
        <b-col xl="6" v-if="this.$cookies.get('previous_searches')" class="mb-2">
          <b-input-group prepend="Previous Searches" size="lg">
            <b-form-select v-model="previous_search_selection"
                           :disabled="api_busy"
                           :options="previous_search_selection_options">
            </b-form-select>
          </b-input-group>
        </b-col>
        <!--Visualisation Switch-->
        <b-col xl="" class="">
          <b-input-group prepend="Visualisation" size="lg">
            <b-input-group-append is-text>
              <b-form-checkbox switch class="ml-1" v-model="show_sunburst" :disabled="to_picker_date_disabled"></b-form-checkbox>
            </b-input-group-append>
            <b-form-input v-if="show_sunburst" id="range-2" size="lg" v-model="display_range" type="range" min="0"
                          max="0.01" step="0.00001"></b-form-input>
            <b-input-group-append v-if="show_sunburst" class="text-monospace">
              <b-input-group-text :class="display_range < 0.001 ? 'text-danger' : 'text-secondary' ">
                {{ Number(display_range).toFixed(5) }}
              </b-input-group-text>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>

      <b-row class="mb-2">
        <b-col>
          <b-button :disabled="import_button_disabled || api_busy===true"
                    block class="mt-2"
                    variant="primary"
                    size="lg"
                    @click="import_button_click">Import Date Range
          </b-button>
        </b-col>
      </b-row>

      <b-row v-if="api_busy && !blockday_selected">
        <b-col>
      <span>
        <b-progress :max="blockday_table_import_max" class="mb-3" height="2rem" show-value>
          <b-progress-bar :label="`${(blockday_table_import_progress)} RETRIEVED`"
                          :value="blockday_table_import_progress"
                          variant="success"></b-progress-bar>
          <b-progress-bar :label="`${(blockday_table_error_count)} / ${(blockday_table_import_max)} FAILED`"
                          :value="blockday_table_error_count"
                          variant="danger"></b-progress-bar>
          <b-progress-bar :label="`${(blockday_table_skip_count)} / ${(blockday_table_import_max)} SKIPPED`"
                          :value="blockday_table_skip_count"
                          variant="info"></b-progress-bar>
          <b-progress-bar :label="`${(future_blockday_import)} PENDING`" :value="future_blockday_import"
                          animated variant="warning"></b-progress-bar>
        </b-progress>
      </span>
        </b-col>
      </b-row>

      <!--BlockDay Table-->
      <b-row v-if="blockday_table && !blockday_table_busy" class="mt-4">
        <b-col>
          <b-table :busy="blockday_table_busy"
                   :fields="blockday_table_fields"
                   :items="blockday_table"
                   :sort-by.sync="blockday_table_sort_by"
                   bordered
                   class=""
                   :hover="!api_busy"
                   :responsive="true"
                   select-mode="single"
                   :selectable="!api_busy"
                   selected-variant="primary"
                   sticky-header="50vh"
                   @row-selected="on_blockday_table_row_selected">
          </b-table>
        </b-col>
      </b-row>
    </b-container>

    <b-container v-if="!sunburst_data && show_sunburst" class="p-3 mb-3">
      <b-row>
        <b-col class="text-center">
          <b-spinner type="grow" variant="info"></b-spinner>
          <h4>Block Visualisation Loading</h4>
        </b-col>
      </b-row>
    </b-container>

    <b-container v-if="sunburst_data && show_sunburst" class="p-3 mb-3">
      <b-row>
        <b-col class="d-inline-flex">
          <h2><strong>Block Visualisation</strong></h2>
          <b-button class="p-2 pl-3 pr-3 ml-auto" :disabled="api_busy" @click="show_sunburst=false"
                    variant="outline-danger">
            X
          </b-button>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <sunburst :data="sunburst_data" style="min-height:60vmin" :minAngleDisplayed=string_to_value(display_range)>

            <!-- Add behaviors -->
            <template slot-scope="{ on, actions }">
              <highlightOnHover v-bind="{ on, actions }"/>
              <zoomOnClick v-bind="{ on, actions }"/>
            </template>

            <!-- Add information to be displayed on top the graph -->
            <nodeInfoDisplayer slot="top" slot-scope="{ nodes }" :current="nodes.mouseOver" :root="nodes.root"
                               :description="description(nodes.mouseOver)" :show-all-number='false'/>

            <!-- Add bottom legend -->
            <breadcrumbTrail slot="legend" slot-scope="{ nodes, colorGetter, width }" :colorGetter="colorGetter"
                             :current="current_node" :from="nodes.clicked" :root="nodes.root" :width="width"/>
          </sunburst>
        </b-col>
      </b-row>
    </b-container>

    <!--Block Table-->
    <b-container v-if="blockday_selected" class="p-3 mb-3">
      <b-row v-if="blockday_selected" class="">
        <b-col class="d-flex">
          <h2><strong>Blocks on {{ date_formatter(blockday_table_selection[0]['_id']) }}</strong></h2>
          <b-button :disabled="block_table_busy || api_busy" :href="block_csv_data_link"
                    class="ml-auto m-2" variant="outline-secondary">
            <b-icon-download></b-icon-download>
            Block Data (CSV)
          </b-button>
          <b-button class="m-2" :disabled="api_busy" @click="blockday_selected = false; block_selected = false"
                    variant="outline-danger">
            X
          </b-button>
        </b-col>
      </b-row>

      <b-row v-if="blockday_selected" class="mb-2">
        <b-col class="">
          <b-table :busy="block_table_busy"
                   :fields="block_table_fields"
                   :items="block_table"
                   :sort-by.sync="block_table_sort_by"
                   bordered
                   class=""
                   :hover="!api_busy"
                   :responsive="true"
                   select-mode="single"
                   :selectable="true"
                   selected-variant="primary"
                   sticky-header="45vh"
                   @row-selected="on_block_table_row_selected">
            <template #table-busy>
              <b-row>
                <b-col>
                  <span>
                    <b-progress :max="block_table_import_max" class="mb-3" height="2rem" show-value>
                      <b-progress-bar :label="`${(block_table_import_progress)} RETRIEVED`"
                                      :value="block_table_import_progress"
                                      variant="info"></b-progress-bar>
                      <b-progress-bar :label="`${(block_table_error_count)} / ${(block_table_import_max)} FAILED`"
                                      :value="block_table_error_count"
                                      variant="danger"></b-progress-bar>
                      <b-progress-bar :label="`${(future_block_import)} PENDING`" :value="future_block_import"
                                      animated variant="warning"></b-progress-bar>
                    </b-progress>
                  </span>
                </b-col>
              </b-row>
            </template>
          </b-table>
        </b-col>
      </b-row>
    </b-container>

    <!--Transaction Table-->
    <b-container v-if="blockday_selected && block_selected" class="p-3 mb-3">
      <b-row v-if="blockday_selected && block_selected" class="mb-2">
        <b-col class="d-flex ">
          <h2><strong>Transactions for Block {{ block_table_selection[0]['height'] }}</strong></h2>
          <b-button :disabled="transaction_table_busy || api_busy" :href="transaction_csv_data_link" class="ml-auto m-2"
                    hover variant="outline-secondary">
            <b-icon-download></b-icon-download>
            Transaction Data (CSV)
          </b-button>
          <b-button class="m-2" :disabled="api_busy" @click="block_selected = false" variant="outline-danger">
            X
          </b-button>
        </b-col>
      </b-row>

      <!--    Transaction Table-->
      <b-row v-if="blockday_selected && block_selected">
        <b-col>
          <b-table :busy="transaction_table_busy"
                   :fields="transaction_table_fields"
                   :items="transaction_table"
                   :sort-by.sync="transaction_table_sort_by"
                   :sort-desc="true"
                   :bordered="true"
                   class="pl-2 pr-2"
                   :responsive="true"
                   sticky-header="85vh">

            <template #table-busy>
              <b-row>
                <b-col>
                  <span>
                    <b-progress :max="transaction_table_import_max" class="mb-3" height="2rem" show-value>
                      <b-progress-bar :label="`${(transaction_table_import_progress)} RETRIEVED`"
                                      :value="transaction_table_import_progress"
                                      variant="info"></b-progress-bar>
                      <b-progress-bar
                          :label="`${(transaction_table_error_count)} / ${(transaction_table_import_max)} FAILED`"
                          :value="transaction_table_error_count"
                          variant="danger"></b-progress-bar>
                      <b-progress-bar :label="`${(future_transaction_import)} PENDING`"
                                      :value="future_transaction_import"
                                      animated variant="warning"></b-progress-bar>
                    </b-progress>
                  </span>
                </b-col>
              </b-row>
            </template>

            <template #cell(show_details)="row">
              <b-button block class="mr-2" size="sm" @click="row.toggleDetails">
                {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
              </b-button>
            </template>

            <template #row-details="row">
              <b-card>
                <b-card-header>
                  <h3>Transaction Details</h3>
                </b-card-header>

                <b-card-body>
                  <b-row>
                    <b-col>
                      <h3 v-if="!row.item.coinbase_transaction">Inputs</h3>
                      <h3 v-if="row.item.coinbase_transaction">Coinbase Transaction</h3>
                      <b-table-simple v-if="!row.item.coinbase_transaction" :responsive="true" :stacked="true"
                                      sticky-header="true">
                        <b-thead>
                          <b-tr>
                            <b-th>Inputs</b-th>
                          </b-tr>
                          <b-tr>
                            <b-th>Address</b-th>
                            <b-th>Value</b-th>
                          </b-tr>
                        </b-thead>
                        <b-tbody style="max-height: 30vh;overflow-y: scroll;">
                          <b-tr v-for="input in row.item.inputs" :key="input.prev_out.addr">
                            <b-td stacked-heading="Value" v-text="currency_formatter(input.prev_out.value)"></b-td>
                            <b-td stacked-heading="Address">{{ input.prev_out.addr }}</b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                    </b-col>
                    <b-col>
                      <h3>Outputs</h3>
                      <b-table-simple :responsive="true" :stacked="true">
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
                        <b-tbody style="max-height: 30vh;overflow-y: scroll;">
                          <b-tr v-for="output in row.item.out" :key="output.addr">
                            <b-td stacked-heading="Value" v-text="currency_formatter(output.value)"></b-td>
                            <b-td stacked-heading="Address">{{ output.addr }}</b-td>
                            <b-td v-if="output.spent" variant="danger" class="text-center b">Spent</b-td>
                            <b-td v-else variant="success" class="text-center b">Not Spent</b-td>
                            <b-td stacked-heading="Output Order">{{ output.n }}</b-td>
                          </b-tr>
                        </b-tbody>
                      </b-table-simple>
                    </b-col>
                  </b-row>
                </b-card-body>
                <b-card-footer>
                    <span>{{ new Date(row.item.time * 1000).toUTCString() }}</span>
                    <br>
                    <span>Transaction Hash: {{row.item._id}}</span>
                </b-card-footer>
              </b-card>
            </template>

          </b-table>
        </b-col>
      </b-row>

    </b-container>
  </div>
</template>


<script>
import {breadcrumbTrail, highlightOnHover, nodeInfoDisplayer, sunburst, zoomOnClick} from 'vue-d3-sunburst'
import "vue-d3-sunburst/dist/vue-d3-sunburst.css"
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

limiter.on("error", function (error) {
  console.log('Limiter Error', error)
})
limiter.on("failed", function (error, info) {
  console.log(error, info)
})

export default {
  name: "BlockExplorer",

  props: {},

  components: {
    breadcrumbTrail,
    highlightOnHover,
    nodeInfoDisplayer,
    sunburst,
    zoomOnClick
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

      currency_csv_download_url: "",

      import_button_disabled: true,

      blockday_table_busy: false,
      blockday_table_import_progress_string: null,
      blockday_table_import_progress: 0,
      blockday_table_import_max: null,
      blockday_table_error_count: 0,
      blockday_table_skip_count: 0,
      blockday_table_completed: false,

      blockday_table: null,
      blockday_table_sort_by: '_id',
      blockday_table_selection: [],
      blockday_selected_date: '',
      blockday_table_fields: [

        {
          key: '_id', label: 'Date', sortable: true, stickyColumn: true, isRowHeader: true, formatter: value => {
            return new Date(value).toLocaleDateString('en-GB')
          }
        },
        {key: "total_num_blocks", label: "Blocks", sortable: true},
        {
          key: "total_num_tx", label: "TXs", sortable: true, formatter: value => {
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

      sunburst_data: null,
      show_sunburst: false,

      current_node: null,
      total_value: 0,
      display_range: 0.005,

      block_table: null,
      blockday_selected: false,
      block_table_sort_by: 'height',
      block_csv_data_link: "",
      block_table_busy: true,
      block_table_selection: [],

      block_table_import_progress: null,
      block_table_import_max: null,
      block_table_error_count: null,

      block_table_fields: [
        {key: "height", sortable: true, stickyColumn: true, isRowHeader: true},
        {
          key: "n_tx", label: "TXs.", sortable: true, formatter: value => {
            return value.toLocaleString('en-GB')
          }
        },
        {
          key: "time", label: 'Time (UTC)', sortable: true, formatter: value => {
            return new Date(value * 1000).toLocaleTimeString('en-GB', {timeZone: 'UTC'})
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

      transaction_table_import_progress: null,
      transaction_table_import_max: null,
      transaction_table_error_count: null,

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
          key: "change_adjusted_total",
          label: "Total Val. Unique Outputs",
          sortable: true,
          formatter: (value, key, item) => {
            if (value  > 0){return this.currency_formatter(value, key, item)}
            else return('Unable to determine change.')
          }
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
    from_picker_date: function (new_value) { // Watch date picker value for updates
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
      this.currency_csv_download_url = `${this.$root.api_combined_address}/csv/currency?date_from=${this.from_picker_date}&date_to=${this.to_picker_date}`
    },
    previous_search_selection: function (selection) {
      this.from_picker_date = selection['from_date']
      this.to_picker_date = selection['to_date']
      this.to_picker_date = selection['to_date']// The first update to the from picker may cause an update to the to picker
    },
    show_sunburst: function (selection) { // Ensure that visualisation switch is toggled and data is present
      if (selection && !this.sunburst_data) {
        this.sunburst_vis_import()
      }
    }
  },

  computed: {
    future_blockday_import: function () { // Calculate values for progress bar
      return (this.blockday_table_import_max - (this.blockday_table_import_progress + this.blockday_table_error_count))
    },
    future_block_import: function () {
      return (this.block_table_import_max - (this.block_table_import_progress + this.block_table_error_count))
    },
    future_transaction_import: function () {
      return (this.transaction_table_import_max - (this.transaction_table_import_progress + this.transaction_table_error_count))
    },

  },

  methods: {
    makeToast: function (variant = null, title = null, body = null, auto_hide = true) { // Show toast notifications
      this.$bvToast.toast(`${body}`, {
        title: `${title}`,
        variant: variant,
        solid: true,
        noAutoHide: !auto_hide
      })
    },

    sunburst_vis_import: function () {
      this.sunburst_data = null
      let url = `${this.$root.api_combined_address}/visualisation/sunburst?from=${this.from_picker_date.toString()}&to=${this.to_picker_date.toString()}`
      console.log('Requesting visualisation data from ', url)
      axios
          .get(url)
          .then(response => {
            this.sunburst_data = response.data
          })
          .catch(error => {
            this.makeToast("Danger", "Visualisation Error", error)
            console.log(error)
          })
    },
    string_to_value: function (string_value) {
      return Number(string_value)
    },
    description: function (mouse_over) {
      let description = "null"
      if (mouse_over) {
        this.current_node = mouse_over
        if (mouse_over.depth === 0) {
          description = 'Total Value for Date Range: '
          this.total_value = mouse_over.value
          return description + ` ₿${(mouse_over.value / 100000000).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` // Regular Expression to comma separate long value strings
        } else if (mouse_over.depth === 1) {
          description = `${mouse_over.data.name}  Total: `
        } else if (mouse_over.depth === 2) {
          description = `Block ${mouse_over.data.name}  Total: `
        }
        let btc_value_total = (this.total_value / 100000000).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        description = description + ` ₿${(mouse_over.value / 100000000).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} / ₿${btc_value_total}`
      }
      return description
    },

    import_button_click: function () {
      this.history_cookies()
      this.blockday_axios_importer()
      if (this.show_sunburst) {
        this.sunburst_vis_import()
      }

      this.previous_search_selection = null
    },


    blockday_axios_importer: function () {
      this.api_busy = true
      this.blockday_table_busy = true

      this.blockday_table_error_count = 0
      this.blockday_table_import_progress = 0
      this.blockday_api_import = []
      this.blockday_table = []
      this.blockday_selected = false
      this.block_selected = false

      let blockday_base_url = `${this.$root.api_combined_address}/blockdays`

      let url_list = []


      let from_date = new Date(this.from_picker_date)
      let to_date = new Date(this.to_picker_date)
      let working_date = new Date(from_date)

      while (working_date.getTime() <= to_date.getTime()) {
        console.log(`Working Date ${working_date.getTime()}, to date ${to_date.getTime()}`)
        url_list.push(blockday_base_url + '?date=' + working_date.toISOString().slice(0, 10))
        working_date.setUTCDate(working_date.getUTCDate() + 1)
      }
      console.log('BlockDay url list: ', url_list)
      this.blockday_table_import_max = url_list.length

      for (let x in url_list) {
        limiter.schedule(() => axios.get(url_list[x])
            .then((results) => {
              this.blockday_api_import.push(results['data'])
              this.blockday_table_import_progress = this.blockday_api_import.length
            })
            .catch(error => {
              this.blockday_table_error_count += 1
              if (error.response) {
                // client received an error response (5xx, 4xx)
                let failed_date = error.response.config.url.slice(-10)
                this.makeToast('danger', `${failed_date}: BlockDay Import Failed`, ('Response Error: ' + error), false)
                console.log('BlockDay Retrieval Failure:', error.response.config.url.slice(-10))
              } else if (error.request) {
                this.makeToast('danger', `BlockDay Import Failed`, ('Request Error: ' + error))
                // client never received a response, or request never left
                this.api_busy = false
                console.log(error.request)
              } else {
                console.log('Uncaught error', error)
                // anything else
              }
            })
            .finally(() => {
              if (url_list.length === (this.blockday_api_import.length + this.blockday_table_error_count)) {
                this.blockday_table = this.blockday_api_import
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
        let previous_searches_string = JSON.stringify(previous_searches) // Encode object into JSON for plaintext storage
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
      this.api_busy = true
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
      this.api_busy = true
      this.block_list_api_import = []
      this.block_table_busy = true
      this.block_table_error_count = 0
      let block_list_base_url = `${this.$root.api_combined_address}/block`

      this.block_table_import_max = block_list.length

      for (let x in block_list) {
        let block_list_combined_url = block_list_base_url + `?hash=${block_list[x]}`
        limiter.schedule(() => axios.get(block_list_combined_url)
            .then((results) => {
              this.block_list_api_import.push(results['data'])
              this.block_table_import_progress = this.block_list_api_import.length
            })
            .catch(error => {
              this.block_table_error_count += 1
              let status_code = error.response.status
              console.log('Block list importer error:', status_code)
              if (status_code === 404) {
                console.log(error.response)
                this.makeToast('warning', 'Block Data Missing', error + `\nBlock Hash: ${error.response.request.responseURL.slice(-64)} `, false)
              } else {
                this.makeToast('danger', 'Block Data Retrieval Failure', error, false)
              }
              this.api_busy = false
              console.log('Block retrieval error:', error.response)
            })
            .finally(() => {
              if (block_list.length === this.block_list_api_import.length + this.block_table_error_count) {
                this.block_table = this.block_list_api_import
                this.block_table_busy = false
                this.api_busy = false
              }
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
      this.transaction_list_api_import = []
      this.transaction_table_busy = true
      let transaction_list_base_url = `${this.$root.api_combined_address}/transaction`
      this.transaction_table_import_max = transaction_list.length

      for (let x in transaction_list) {
        let transaction_list_combined_url = transaction_list_base_url + `?hash=${transaction_list[x]}`
        limiter.schedule(() => axios.get(transaction_list_combined_url))
            .then((results) => {
              this.transaction_list_api_import.push(results['data'])
              this.transaction_table_import_progress = this.transaction_list_api_import.length
            })
            .catch(error => {
              this.api_busy = false
              this.makeToast('danger', 'Transaction Retrieval Failure', error, false)
              console.log(error)
            })
            .finally(() => {
              if (transaction_list.length === this.transaction_list_api_import.length + this.transaction_table_error_count) {
                this.transaction_table = this.transaction_list_api_import
                this.transaction_table_busy = false
                this.api_busy = false
              }
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
            this.makeToast('warning', 'Currency Retrieval Error', error)
          })
    },

    currency_formatter: function (input, key, item, toFixed = 2) {
      if (this.currency_chosen_value === 'XBP') {
        if ((input / 100000000).toFixed(2) > 0) {
          return '₿' + ((input / 100000000).toFixed(toFixed)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        } else if (input === 0) {
          return '₿' + input
        } else {
          return '₿' + ((input / 100000000).toFixed(6)).toLocaleString('en-GB')
        }
      } else {
        let sat_to_btc = input / 100000000

        let retrieval_date_string = ''

        if (this.blockday_selected) {
          retrieval_date_string = this.blockday_selected_date //Get the ID from
        } else {
          retrieval_date_string = item._id
        }

        let selected_base = this.currency_data[retrieval_date_string][this.currency_chosen_value]
        let currency_value = (sat_to_btc * selected_base)
        let fixed_value = 0

        if (currency_value.toFixed(toFixed) > 0) {
          fixed_value = currency_value.toFixed(toFixed)
        } else if (currency_value === 0) {
          fixed_value = 0
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

    date_formatter: function (date) {
      return new Date(date).toLocaleDateString()
    },

    prevent_navigation: function (event) {
      if (!this.api_busy) return
      event.preventDefault()
      event.returnValue = ""
    }
  }, // prevent navigation during api access methods
  beforeMount() {
    window.addEventListener("beforeunload", this.prevent_navigation)
  },
  mounted() {
    document.title = this.$route.name + this.$root.title_brand
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

