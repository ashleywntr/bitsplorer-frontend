<template>
  <div>
    <b-container class="p-3 mb-3">
      <b-row class="">
        <b-col><h1><strong>Address Explorer</strong></h1></b-col>
      </b-row>

      <b-row class="mb-4">
        <b-col>
          <b-input-group prepend="Currency" size="lg">
            <b-form-select v-model="currency_chosen_value"
                           :disabled="api_busy"
                           :options="currency_options">
            </b-form-select>
          </b-input-group>
        </b-col>
      </b-row>

      <b-row class="mt-3 mb-3">
        <b-col>
          <b-input-group prepend="Address Hash" size="lg">
            <b-form-input id="address-form-input"
                          v-model="address_entry"
                          placeholder="Address Hash"
                          type="search"
                          trim>
            </b-form-input>
            <b-input-group-append>
              <b-button :disabled="api_busy" class="btn" variant="primary" @click="address_populator(address_entry)">
                <b-spinner v-if="api_busy" type="grow" small></b-spinner>
                <b-icon-search v-else/>
              </b-button>
            </b-input-group-append>
          </b-input-group>
        </b-col>
      </b-row>

      <b-row class="" v-if="this.$cookies.get('previous_address_searches')">
        <b-col>
          <b-input-group prepend="Previous Searches" size="lg">
            <b-form-select v-model="previous_address_search_selection"
                           :disabled="api_busy"
                           :options="previous_address_search_selection_options">

            </b-form-select>
          </b-input-group>
        </b-col>
      </b-row>
    </b-container>

    <b-container v-if="!(address_table_array.length === 0)" class="p-3 mb-3 d-flex" >
      <b-row style="max-height: available; overflow-y: scroll">
        <b-col>
          <b-card v-for="entry in address_table_array" :key="entry._id" :id="entry._id">
            <b-card-header class="d-flex">
              <h4 style="word-break: break-all">{{ entry._id }}</h4>
              <b-button @click="address_remover(entry._id)" variant="outline-danger" class="ml-auto"><strong>X</strong>
              </b-button>
            </b-card-header>

            <b-card-body>
              <b-row v-if="entry.abuse_count">
                <b-col>
                  <b-alert dismissible :show="true" variant="danger">BitcoinAbuse: Malicious Activity Identified for
                    this address
                    <a :href="'https://www.bitcoinabuse.com/reports/'+entry._id" target="_blank">
                      ({{
                        entry.abuse_count > 1 ? entry.abuse_count + ' instances' : entry.abuse_count + ' instance'
                      }})</a>
                  </b-alert>
                </b-col>
              </b-row>

              <b-row v-if="!entry.abuse_count">
                <b-col>
                  <b-alert dismissible :show="true" variant="success">BitcoinAbuse: No Malicious Activity Identified for
                    this
                    address
                  </b-alert>
                </b-col>
              </b-row>

              <b-row v-if="!(entry.native_abuse_data.length === 0)">
                <b-col>
                  <b-alert dismissible :show="true" variant="warning">BITSPLORER: Malicious Activity Flagged in Bitsplorer database. <a @click="entry.show_native_abuse_data = !entry.show_native_abuse_data"><u>{{entry.show_native_abuse_data ? 'Hide' : 'Show'}}</u></a>
                  </b-alert>
                </b-col>
              </b-row>

              <b-row v-if="!entry.abuse_check">
                <b-col>
                  <b-alert dismissable :show="true" variant="warning">Failed to retrieve abuse report</b-alert>
                </b-col>
              </b-row>

              <b-row v-if="entry.show_native_abuse_data">
                <b-col>
                  <b-table :fields="abuse_table_fields"
                            :items="entry.native_abuse_data">

                    <template #cell(source)="source">
                      <p style="word-break: break-all">{{source.value}}</p>
                    </template>
                  </b-table>
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

              <b-row>
                <b-col>
                  <b-pagination v-if="entry.n_tx > transaction_table_per_page"
                                v-model="entry.current_page"
                                :total-rows="entry.n_tx"
                                :per-page="transaction_table_per_page"
                                align="fill"
                                first-number
                                last-number
                  ></b-pagination>
                  <b-table :fields="transaction_table_fields"
                           :items="itemsProvider"
                           :per-page="transaction_table_per_page"
                           :current-page="entry.current_page"
                           :no-provider-filtering="true"
                           :no-provider-sorting="true"
                           :no-provider-paging="false"
                           :bordered="true"
                           class="pl-2 pr-2"
                           sticky-header="60vh"
                           :responsive="true"
                            :id="'table_'+entry._id"
                            :api-url="entry._id">

                    <template #cell(show_details)="row">
                      <b-button block class="mr-2" size="sm" @click="row.toggleDetails">
                        {{ row.detailsShowing ? 'Hide' : 'Show' }} Details
                      </b-button>
                    </template>

                    <template #table-busy>
                      <div class="text-center text-danger my-2">
                        <b-progress variant="warning" animated max="1" value="1"></b-progress>
                      </div>
                    </template>

                    <template #row-details="row">
                      <b-card>
                        <b-card-header>
                          <h3>Transaction Details</h3>
                          <h4 class="danger">{{ transaction_type_checker(entry._id, row) }}</h4>
                        </b-card-header>
                        <b-card-body>
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
                                <b-tbody style="max-height: 30vh;overflow-y: scroll;">
                                  <b-tr v-for="input in row.item.inputs" :key="input.script">
                                    <b-td stacked-heading="Value"
                                          v-text="currency_formatter(input.prev_out.value)"></b-td>
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
                                  <b-tr v-for="output in row.item.out" :key="output.script">
                                    <b-td stacked-heading="Value" v-text="currency_formatter(output.value)"></b-td>
                                    <b-td stacked-heading="Address">
                                      <a v-if="output.addr !== entry._id" :href="'#'+output.addr"
                                         @click="address_populator(output.addr)">{{ output.addr }}</a>
                                      <u v-else>{{ output.addr }}</u>
                                    </b-td>
                                    <b-td v-if="output.spent" variant="danger" class="text-center">Spent</b-td>
                                    <b-td v-else variant="success" class="text-center">Not Spent</b-td>
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
                          <span>Transaction Hash: {{ row.item._id }}</span>
                        </b-card-footer>
                      </b-card>
                    </template>
                  </b-table>
                </b-col>
              </b-row>
            </b-card-body>
            <b-card-footer>
              <b-button v-if="!entry.toggleAbuseForm" @click="entry.toggleAbuseForm = true">File Report</b-button>
              <div v-if="entry.toggleAbuseForm">
              <div class="d-flex mb-2">
                <h3>File Address Report</h3>
                <b-button class="ml-auto" variant="outline-danger" @click="entry.toggleAbuseForm = false">X</b-button>
              </div>
              <span>
                <b-form @submit.stop.prevent="abuse_submit" reset="" v-if="true">
                  <b-input-group prepend="Address" class="mb-2"><b-form-input id="abuse_address" name="address" :value="entry._id" :disabled="true"/></b-input-group>
                  <b-input-group prepend="Source" class="mb-2"><b-form-input id="abuse_source" name="source"/></b-input-group>
                  <b-input-group prepend="Date" class="mb-2"><b-form-datepicker id="abuse_date" name="date" :max="max_date" v-model="report_picker"/></b-input-group>
                  <b-input-group prepend="Notes" class="mb-2"><b-form-textarea id="abuse_notes" name="notes"/></b-input-group>

                  <b-button type="submit" variant="primary" class="mr-2">Submit</b-button>
                  <b-button type="reset" variant="danger">Reset</b-button>
                </b-form>
              </span>
              </div>
            </b-card-footer>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

    <b-container class="p-3 mb-3" v-if="!(address_table_array.length === 0)">
      <b-row>
        <b-col class="d-flex">
          <h1><strong>Visualiser</strong></h1>
          <b-button @click="initialise_graph" class="ml-auto" variant="outline-secondary"><b-icon-arrow-clockwise/></b-button>
        </b-col>
      </b-row>
      <b-row class="border-success">
        <b-col>
          <div ref="vis"/>
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>


<script>
import axios from "axios"
import * as d3 from "d3"
import "d3-force"
import "d3-drag"

const now = new Date
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const max_date = new Date(today)

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
      address: null,
      max_date: max_date,
      report_picker: max_date,
      address_entry: null,
      address_table_fields: [
        {key: 'n_tx', label: 'Total TXs', formatter: value =>{
            return value.toLocaleString('en-GB')
          }},
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

      abuse_table_fields: [
        {key: 'date', label: 'Report Date', formatter: value => {return new Date(value).toLocaleDateString('en-GB')}},
        {key: 'source', label: 'Report Source' },
        {key: 'notes', label: 'Report Notes'}
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
      ],
      transaction_table_total_rows: 0,
      transaction_table_per_page: 100,
    }
  },
  mounted() {
    document.title = this.$route.name + this.$root.title_brand
    this.currency_value_retriever()
    if (this.$cookies.get('previous_address_searches')) {
      this.address_main_search_history_cookie()
    }
    if (this.$route.params.auto_address){
      let address = this.$route.params.auto_address
      this.address_populator(address)
      this.makeToast('info', 'Retrieving Flagged Address Details', `Retrieving info for address ${address}`)
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
      this.api_busy = true
      this.address_main_search_history_cookie(address)
      let url = `${this.$root.api_combined_address}/address?hash=${address}`
      console.log("Retrieving Extra Address Data from", url)
      let return_object = {}
      axios
          .get(url)
          .then(response => {
            console.log('Address Response Received')
            return_object = response.data
            return_object.toggleAbuseForm = false
            return_object.show_native_abuse_data = false
            this.api_busy = false
            console.log("Extra Address Data Retrieval Complete")
            return_object.current_page=0
            return_object.transaction_page_data = []
            this.address_table_array.push(return_object)
          })
          .catch(error => {
            this.makeToast('danger', 'Address Import Error', error)
            console.log(error)
          })
          .finally(() => {
            this.api_busy = false
            this.initialise_graph()
          })
    },
    transaction_table_importer: function (address) {
      this.api_busy = true
      let transaction_retrieval_url = `${this.$root.api_combined_address}/address/transactions?hash=${address}`
      let return_list = []
      console.log("Retrieving Extra Address Transaction Data from ", transaction_retrieval_url)
      axios
          .get(transaction_retrieval_url)
          .then(response => {
            let working_index = 0
            return_list = response.data['txs']
            this.address_table_array.forEach((entry, i) => {
              if (entry._id === address) {
                working_index = i
              }
            })
            let target = this.address_table_array[working_index]
            target.transaction_data = return_list
            this.$set(this.address_table_array, working_index, target)
          })
          .catch(error => {
            this.makeToast('danger', 'Address Transaction Import Error', error)
            console.log(error)
          })
          .finally(() => {
            this.api_busy = false
          })
    },

    address_populator: function (address) {
      if (address) {
        this.address_entry = null
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
      } else {
        this.makeToast('info', 'Invalid Input', 'Please input address for import.')
      }
    },
    itemsProvider: function (ctx) {
      console.log(ctx)
      let offset = 0 // if statement check to prevent negative offset
      if (ctx.currentPage > 0){
        offset = this.transaction_table_per_page * (ctx.currentPage - 1)
      }
      let url = `${this.$root.api_combined_address}/address/transactions?hash=${ctx.apiUrl}&offset=${offset}`
      console.log("Retrieving Paginated Transaction Data from ", url)
      return axios.get(url)
            .then(response =>{
              let data = response.data.txs
              console.log("Transaction data for offset", offset, data)
              return data || []
            })
            .catch(()=>{
              return []
            })
    },
    address_remover: function (address) {
      this.address_table_array.forEach((entry, index) => {
        if (entry._id === address) {
          this.$delete(this.address_table_array, index)
        }
      })
    },

    address_main_search_history_cookie(address) {
      let previous_address_searches = []
      let current_time = new Date()

      if (this.$cookies.get('previous_address_searches')) {
        previous_address_searches = JSON.parse(this.$cookies.get('previous_address_searches'))
      }
      if (address) {
        previous_address_searches.push({
          address: address,
          request_date: current_time
        })
      }
      let previous_address_searches_string = JSON.stringify(previous_address_searches)
      this.$cookies.set("previous_address_searches", previous_address_searches_string)
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

        if (!in_list && previous_address_searches[x]) {
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
    transaction_type_checker: function (address_hash, transaction_info) {
      let address_in_inputs = false
      let address_in_outputs = false

      transaction_info.item.inputs.forEach((input) => {
        if (address_hash === input.prev_out.addr) {
          address_in_inputs = true
        }
      })
      transaction_info.item.out.forEach((output) => {
        if (address_hash === output.addr) {
          address_in_outputs = true
        }
      })

      if (address_in_inputs && address_in_outputs) {
        return ("Sender & Recipient")
      } else if (address_in_inputs && !address_in_outputs) {
        return ("Sender Only")
      } else if (!address_in_inputs && address_in_outputs) {
        return ("Recipient Only")
      }

      return ("check failed")
    },

    initialise_graph: function () {
      console.log('Initialising Graph')
      d3.select(this.$refs.vis).selectAll("*").remove()
      const width = this.$refs.vis.clientWidth
      const height = 500

      const range = width / 16
      let domain = 0

      this.address_table_array.forEach((item) => {
        if (item.total_received > domain){
          domain = item.total_received
        }
      })
      let circle_scale = d3.scaleSqrt()
        .domain([0, domain])
        .range([15, range])

      const addr_vis = d3.select(this.$refs.vis)
          .append("svg")
          .attr("width", width)
          .attr("height", height)

      const simulation = d3.forceSimulation()
          .force('charge', d3.forceManyBody().strength(-20))
          .force('center', d3.forceCenter(width / 2, height / 2))

      const node_elements = addr_vis.append("g")
          .selectAll("circle")
          .data(this.address_table_array)
          .enter().append('circle')
          .attr('r', node => circle_scale(node.total_received))
          .attr('fill', node =>  {
            if (!(node.abuse_count === 0)){
              return '#ff0000'
            }
            else return '#9301a2'
          })

      const text_elements = addr_vis.append('g')
          .selectAll('text')
          .data(this.address_table_array)
          .enter().append('text')
          .text(node => node._id)
          .style('font-size', 15)
          .style("text-anchor", "middle")
          .attr('dy', node => {
            return -circle_scale(node.total_received) -15
          })

      const dragDrop = d3.drag()
      .on('start', node => {
        console.log("Drag Start")
        node.fx = node.x
        node.fy = node.y
      })
      .on('drag', (event, node) => {
        console.log("Drag Drag")
        simulation.alphaTarget(0.7).restart()
        node.fx = event.x
        node.fy = event.y
      })
      .on('end', (event, node) => {
        simulation.alphaTarget(0)
        node.fx=null
        node.fy=null
      })
      node_elements.call(dragDrop)

      simulation.nodes(this.address_table_array).on('tick', () => {
        node_elements
            .attr('cx', node => node.x)
            .attr('cy', node => node.y)
        text_elements
            .attr('x', node => node.x)
            .attr('y', node => node.y)
      })
    },

    currency_value_retriever: function () {
      let currency_retrieval_url = `${this.$root.api_combined_address}/currency?date_from=${date_string}&date_to=${date_string}`
      console.log('Currency Retrieval', currency_retrieval_url)
      axios.get(currency_retrieval_url)
          .then(results => {
            this.currency_data = results.data
          })
          .catch(error => {
            console.log('Transaction Retrieval Error:', error)
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

        let selected_base = this.currency_data[date_string][this.currency_chosen_value]
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
    abuse_submit: function (form){
      let post_form = new FormData()
      let post_url = `${this.$root.api_combined_address}/post/flagging/address`
      form.target.forEach((x) => {
        if(x.name) {
          post_form.append(x.name, x.value)
        }
      })
      axios.post(post_url, post_form)
      .then(results=>{
        this.makeToast('success', 'Address Report Submitted', 'Submission Successful')
        console.log(results)
      })
      .catch(error=>{
        this.makeToast('danger', 'Address Report Failure', error)
      })
    }
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
