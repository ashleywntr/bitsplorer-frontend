<template>
  <div id="app">
      <b-navbar class ="navbar navbar-light navbar-expand-md" toggleable="md" sticky>
          <b-navbar-brand>
            <router-link class="navbar-brand" to="/">
              <strong class="bitsplorer-brand">₿ITSPLOR£R</strong>
            </router-link>
            <b-nav-text>{{this.$root.app_state}}</b-nav-text>
          </b-navbar-brand>
          <b-navbar-toggle target="nav-text-collapse"></b-navbar-toggle>
          <b-collapse id="nav-text-collapse" is-nav>
            <b-navbar-nav>
              <b-nav-text><router-link class="nav-link" to="/" :class="{active: $route.name==='Home'}">Home</router-link></b-nav-text>
              <b-nav-item-dropdown text="Address Explorer" class="nav-link" :class="{active: ($route.name==='Address Explorer' | $route.name==='Flagged Addresses')}">
                <b-dropdown-item to="/AddressExplorer" >Address Explorer</b-dropdown-item>
                <b-dropdown-item to="/FlaggedAddresses">Flagged Addresses</b-dropdown-item>
              </b-nav-item-dropdown>
              <b-nav-text><router-link class="nav-link" to="/BlockExplorer" :class="{active: $route.name==='Block Explorer'}">Block Explorer</router-link></b-nav-text>
<!--              <b-nav-text><router-link class="nav-link" to="TransactionExplorer" :class="{active: $route.name==='Transaction Explorer'}">Transaction Explorer</router-link></b-nav-text>-->
              <!--              <b-nav-text><router-link class="nav-link" to="/SavedSearches">Saved Searches</router-link></b-nav-text>-->
            </b-navbar-nav>

            <b-navbar-nav class="ml-auto">
              <b-nav-form>
              <b-input-group>
                <b-input-group-prepend>
                  <b-input-group-text>{{this.$root.api_address}}</b-input-group-text>
                </b-input-group-prepend>
<!--                <b-form-select v-model="currency_chosen_value"-->
<!--                               :disabled="api_busy"-->
<!--                               :options="currency_options"-->
<!--                >-->
<!--                </b-form-select>-->
                <b-input-group-append>
                  <b-input-group-text>
                    <div>{{connection_status}}</div>
                  </b-input-group-text>
                </b-input-group-append>
              </b-input-group>
              </b-nav-form>
              <b-nav-text><router-link class="nav-link" to="/Settings" :class="{active: $route.name==='Settings'}"><b-icon-gear-fill></b-icon-gear-fill></router-link></b-nav-text>
            </b-navbar-nav>

          </b-collapse>
      </b-navbar>

    <div class="mt-5">
      <RouterView></RouterView>
    </div>

    <div class="footer-basic">
      <footer>
        <div class="social"><img alt="bitcoin logo public domain" class="img-fluid"
                                 src="./assets/img/Bitcoin_logo.svg" style="width: 196px;"></div>
        <div class="copyright"><b-icon-bootstrap/>{{this.$root.title_brand}} 2020 - 2022</div>
        <div class="copyright">Blockchain Data Powered by <a href="https://www.blockchain.com/explorer">Blockchain.com</a></div>
        <div class="copyright">Historical Price Data Powered by <a href="https://www.coindesk.com/price/bitcoin">CoinDesk</a>; <a href="https://freecurrencyapi.com/">FreeCurrencyAPI</a></div>
      </footer>
    </div>
  </div>
</template>

<script>
import axios from "axios"

export default {
  name: 'App',
  data: function() {
    return{
      connection_status: null
    }
  },

  mounted: function(){
    let url  = this.$root.api_combined_address
    console.log(url)
    axios.get(url)
      .then(response=>{
        if(response.status===200){
          this.connection_status=`API Online`
        }
        else{
          this.connection_status = 'API Offline'
        }
      })
      .catch()
    {
      this.connection_status = 'API Offline'
    }

  },
  methods: {
  },
  computed:{

  }

}

</script>

<style>
</style>
