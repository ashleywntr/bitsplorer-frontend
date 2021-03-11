<template>
  <b-container>
    <b-row class="pt-3">
      <b-col>
        <h1>
          <strong>Block Visualisation</strong>
        </h1>
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
        <b-row>
          <b-col>
            <b-button :disabled="import_button_disabled || api_busy===true"
                      block class="mt-2"
                      variant="primary"
                      @click="sunburst_date_range_importer">
              Populate Graph</b-button>
          </b-col>
        </b-row>
        <b-row v-if="sunburst_data">
            <label class="mt-2">Minimum Radian Display Value: {{ display_range }}</label>
            <b-form-input id="range-2" v-model="display_range" type="range" min="0" max="0.01" step="0.00001"></b-form-input>
        </b-row>

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
                         description="of the total transaction value took place on this day."/>

      <!-- Add bottom legend -->
      <breadcrumbTrail slot="legend" slot-scope="{ nodes, colorGetter, width }" :colorGetter="colorGetter"
                       :current="nodes.mouseOver" :from="nodes.clicked" :root="nodes.root" :width="width"/>
    </sunburst>
      </b-col>
    </b-row>

  </b-container>
</template>

<script>
import {breadcrumbTrail, highlightOnHover, nodeInfoDisplayer, sunburst, zoomOnClick} from 'vue-d3-sunburst'
import "vue-d3-sunburst/dist/vue-d3-sunburst.css"
import axios from 'axios'

export default {
  components: {
    breadcrumbTrail,
    highlightOnHover,
    nodeInfoDisplayer,
    sunburst,
    zoomOnClick
  },
  data() {
    return {
      sunburst_data:  null,

      from_picker_date: null,
      from_picker_date_disabled: false,
      from_picker_date_max_value: null,
      from_picker_date_min_value: null,

      to_picker_date: null,
      to_picker_date_disabled: false,
      to_picker_date_max_value: null,
      to_picker_date_min_value:null,

      import_button_disabled: false,
      api_busy: false,
      display_range: 0.005,
    }
  },
  methods: {
    sunburst_date_range_importer: function () {
      this.api_busy = true
      this.sunburst_data = null
      let url = `${this.$root.api_combined_address}/visualisation/sunburst?from=${this.from_picker_date.toString()}&to=${this.to_picker_date.toString()}`
      console.log('Requesting visualisation data from ', url)
      axios
          .get(url)
          .then(response => {
            this.sunburst_data = response.data
            this.api_busy = false
          })
          .catch(error => {
            this.failed_error_message = error
            console.log(error)
          })
    },
    string_to_value: function(string_value){
      return Number(string_value)
    }
  },
  computed:{

  }
}

</script>

<style scoped>

</style>
