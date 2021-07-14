<template>
<div>
  <b-container class="p-3 mb-3">
    <b-row class="">
      <b-col><h1><strong>Flagged Address Browser</strong></h1></b-col>
    </b-row>
    <b-row>
      <b-col>
        <b-table :busy="abuse_table_busy"
                 :fields="abuse_table_fields"
                 :items="abuse_table"
                 :sort-by.sync="abuse_table_sort_by"
                 bordered
                 :hover="!api_busy"
                 select-mode="single"
                 :selectable="!api_busy"
                 selected-variant="primary">

          <template #cell(erase_entry)="row">
            <b-button variant="outline-danger" @click="abuse_remove(row.item)"><b-icon-trash/></b-button>
          </template>

        </b-table>
      </b-col>
    </b-row>
  </b-container>
  <b-container class="p-3">
      <b-row class="d-flex mb-2"><b-col><h3>File Address Report</h3></b-col></b-row>
      <b-row>
        <b-col>
          <b-form @submit.stop.prevent="abuse_submit" reset="" v-if="true" ref="abuse_form">
            <b-input-group prepend="Address" class="mb-2"><b-form-input id="abuse_address" name="address"/></b-input-group>
            <b-input-group prepend="Source" class="mb-2"><b-form-input id="abuse_source" name="source"/></b-input-group>
            <b-input-group prepend="Date" class="mb-2"><b-form-datepicker id="abuse_date" name="date" :max="max_date" v-model="report_picker"/></b-input-group>
            <b-input-group prepend="Notes" class="mb-2"><b-form-textarea id="abuse_notes" name="notes"/></b-input-group>

            <b-button type="submit" variant="primary" class="mr-2">Submit</b-button>
            <b-button type="reset" variant="danger">Reset</b-button>
          </b-form>
        </b-col>
      </b-row>
  </b-container>
</div>
</template>

<script>
import axios from "axios"

const now = new Date
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const max_date = new Date(today)

export default {
  name: "FlaggedAddresses",

  data() {
    return {
      abuse_table: [],
      abuse_table_busy: false,
      abuse_table_fields: [
        {key: 'address', sortable: true},
        {key: 'source', sortable: true},
        {key: 'notes'},
        {key: 'date', sortable: true, formatter: value => {
            return new Date(value).toLocaleDateString('en-GB')
          }},
        {key: 'erase_entry', label: ''}
      ],
      abuse_table_sort_by: 'date',
      api_busy: false,

      max_date: max_date,
      report_picker: max_date,
    }
  },
  methods:{
    makeToast: function (variant = null, title = null, body = null, auto_hide = true) {
      this.$bvToast.toast(`${body}`, {
        title: `${title}`,
        variant: variant,
        solid: true,
        noAutoHide: !auto_hide
      })
    },

    retrieve_table: function (){
      let url = `${this.$root.api_combined_address}/abuse`
      axios
      .get(url)
      .then(
          response =>{
            this.abuse_table = response.data
          }
      )
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
          }).finally(()=>{
            this.$refs.abuse_form.reset()
        this.retrieve_table()
      })
    },
    abuse_remove: function(item){
      console.log(item)
      let post_form = new FormData()
      let post_url = `${this.$root.api_combined_address}/post/flagging/remove`

      post_form.append('_id', item._id)

      axios.post(post_url, post_form)
      .then((response)=>{
        this.makeToast('success', 'Report removed successfully', response.data)}
      ).catch(error=>{
        this.makeToast('danger', 'Address Report Failure', error)
      }).finally(()=>{
          this.retrieve_table()}
      )
    }
  },
  mounted(){
    document.title = this.$route.name + this.$root.title_brand
    this.retrieve_table()
  }

}
</script>

<style scoped>

</style>
