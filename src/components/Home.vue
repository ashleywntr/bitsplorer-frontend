<template>
  <b-container>
    <b-row class="pt-3">
      <b-col>
        <h1><strong>Home</strong></h1>
        <p>Welcome to py-chain! The Bitcoin Blockchain explorer.</p>
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <h2>Current BTC Rates</h2>
      </b-col>
      <b-col>
        <h3>{{retrieval_time}}</h3>
      </b-col>
    </b-row>

    <b-row>
      <b-col>
      <b-table-simple v-if="disclaimer" responsive stacked>
        <b-thead>
          <b-tr>
            <b-th>USD Value</b-th>
          </b-tr>
          <b-tr>
            <b-th>GBP Value</b-th>
          </b-tr>
          <b-tr>
            <b-th>EUR Value</b-th>
          </b-tr>
        </b-thead>
        <b-tbody>
          <b-tr>
            <b-td stacked-heading="USD Value">${{USD_Value}}</b-td>
            <b-td stacked-heading="GBP Value">£{{GBP_Value}}</b-td>
            <b-td stacked-heading="EUR Value">€{{EUR_Value}}</b-td>
          </b-tr>
        </b-tbody>
      </b-table-simple>
      </b-col>
    </b-row>

  </b-container>
</template>

<script>
import axios from "axios"
export default {
name: "Home",
  mounted(){
    document.title = "Home | py-chain"
    this.price_checker()
  },
  methods:{
    price_checker: function (){
      this.abuse_failed = false
      this.address_abuse_retrieval = false

      let url = `${this.$root.coindesk_root_url}/currentprice.json`

      axios
          .get(url)
          .then(response => {
            console.log(response.data)
            this.USD_Value = response.data.bpi.USD.rate
            this.GBP_Value = response.data.bpi.GBP.rate
            this.EUR_Value = response.data.bpi.EUR.rate
            this.retrieval_time = response.data.time.updateduk
            this.disclaimer = response.data.disclaimer
          })
          .catch(error => {
            this.failed_error_message = error
            this.price_check_failed = true
            console.log(error)
          })
    }
  },
  data(){
    return{
      retrieval_time: "",
      USD_Value: 0.0,
      GBP_Value: 0.0,
      EUR_Value: 0.0,
      price_check_failed: false,
      disclaimer: ""
    }
  }

}

</script>

<style scoped>

</style>
