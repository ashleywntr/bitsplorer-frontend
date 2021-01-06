<template>
  <div id="app">
      <b-navbar class ="navbar navbar-light navbar-expand-md" toggleable="md">
        <div class="container-fluid">
          <b-navbar-brand>
            <router-link class="navbar-brand" to="/">
              <strong>py-chain</strong>
            </router-link>
            <b-nav-text>{{this.$root.app_state}}</b-nav-text>
          </b-navbar-brand>

          <b-navbar-toggle target="nav-text-collapse"></b-navbar-toggle>
          <b-collapse id="nav-text-collapse" is-nav>
            <b-navbar-nav>
              <b-nav-text><router-link class="nav-link" to="/">Home</router-link></b-nav-text>
              <b-nav-text><router-link class="nav-link" to="/AddressExplorer">Address Explorer</router-link></b-nav-text>
              <b-nav-text><router-link class="nav-link" to="/BlockExplorer">Block Explorer</router-link></b-nav-text>
              <b-nav-text><router-link class="nav-link" to="/SavedSearches">Saved Searches</router-link></b-nav-text>
              <b-nav-text><router-link class="nav-link" to="/Settings">Settings</router-link></b-nav-text>
              <b-nav-text><router-link class="nav-link" to="/Visualiser">Visualiser</router-link></b-nav-text>
            </b-navbar-nav>
          </b-collapse>
          <b-nav-text>{{connection_status}}</b-nav-text>
        </div>
      </b-navbar>
    <div>
      <RouterView></RouterView>
    </div>

    <div class="footer-basic">
      <footer>
        <div class="social"><img alt="bitcoin logo public domain" class="img-fluid"
                                 src="./assets/img/Bitcoin_logo.svg" style="width: 196px;"></div>
        <ul class="list-inline">
          <li class="list-inline-item"><router-link to="/">Home</router-link></li>
        </ul>

        <p class="copyright">py-chain 2020</p>
        <p class="copyright">Historical Price Data Powered by <a href="https://www.coindesk.com/price/bitcoin">CoinDesk</a></p>
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
          this.connection_status=`Connected to API`
        }
        else{
          this.connection_status = 'Disconnected from Server'
        }
      })
      .catch()
    {
      this.connection_status = 'Disconnected from Server'
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
