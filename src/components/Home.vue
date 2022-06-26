<template>
  <div>
  <b-container>
    <b-row class="pt-3">
      <b-col>
        <h1><strong>Home</strong></h1>
        <p>Welcome to {{this.$root.brand_text}}! The Bitcoin Blockchain explorer.</p>
        <h2>About</h2>
        <p>Bitsplorer was created to allow users to explore the Bitcoin blockchain. The system was shaped around the requirements of the client,  Dr Henry Hillman of the Faculty of Business and law at UWE Bristol. His previous research focussed on how Bitcoin could be used to facilitate money laundering, and he was seeking a purpose built tool to allow him to conduct analysis of the Bitcoin blockchain. The Bitsplorer application was created to address these aims, consisting of a frontend developed in Vue, with data supplied and processed by a Python Flask backend framework, using MongoDB for storage.
        </p>
      </b-col>
    </b-row>

    <b-row v-if="disclaimer">
      <b-col>
        <h2>Current XBP Rates</h2>
        <h4>{{retrieval_time}}</h4>
      </b-col>

      <b-col>
      <b-table-simple responsive stacked>
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

  <b-container v-if="news.length">
    <b-row class="pt-3">
      <b-col>
        <h1>Bitcoin News</h1>
      </b-col>
    </b-row>

    <b-row style="max-height: 80vh;overflow-y: scroll;">
      <b-col>
      <b-card-group columns>
        <div v-for="article in news" :key="article.url">
        <b-card
        :title="article.title"
        :img-src="article.urlToImage"
        style="max-width: 20rem"
        :sub-title="article.author ? article.source.name+ ' - ' + article.author : article.source.name"
        :footer="formatted_date(article.publishedAt)">
          <b-card-text>{{article.description}}</b-card-text>
          <b-link :href="article.url" target="_blank">Full Text</b-link>
        </b-card>
        </div>
      </b-card-group>
      </b-col>
    </b-row>
  </b-container>
  </div>
</template>

<script>
import axios from "axios"

export default {
name: "Home",
  mounted(){
    document.title = this.$route.name + this.$root.title_brand
    this.price_checker()
    this.news_retrieval()
  },
  methods:{
    price_checker: function (){
      this.abuse_failed = false
      this.address_abuse_retrieval = false

      let url = `${this.$root.coindesk_root_url}/currentprice.json`

      axios
          .get(url)
          .then(response => {
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
    },
    news_retrieval: function(){
      let url =  `${this.$root.api_combined_address}/news`
      console.log('Retrieving latest news from',url)
      axios.get(url)
      .then(response =>{
        this.news = response.data.articles
      })
    },
    formatted_date: function(format_string) {
      return new Date(format_string).toLocaleString('en-GB')
    }
  },
  data(){
    return{
      retrieval_time: "",
      USD_Value: 0.0,
      GBP_Value: 0.0,
      EUR_Value: 0.0,
      price_check_failed: false,
      disclaimer: "",

      news: []
    }
  }
}

</script>

<style scoped>

</style>
