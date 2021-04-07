<template>
    <b-container>
      <b-row class="pt-3">
        <b-col>
          <h1><strong>Settings</strong></h1>
        </b-col>
      </b-row>

      <b-row>
        <b-col md="auto">
          <b-row>
            <b-col>
              <h2>API Connections</h2>
            </b-col>
          </b-row>

          <b-row>
            <b-col md="auto">
                <b-input-group prepend="Hostname / IP Address" class="mb-3">
                  <b-form-input id="address_input" v-model="this.$root.api_address"></b-form-input>
                </b-input-group>
            </b-col>
            <b-col>
              <b-input-group prepend="Port" class="mb-3">
                <b-form-input id="port_input" v-model="this.$root.api_port"></b-form-input>
              </b-input-group>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </b-container>
</template>

<script>
export default {
name: "Settings",
  mounted(){
    document.title = this.$options.name + this.$root.title_brand
  },
}

</script>

<style scoped>

</style>
