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
              <b-form>
                <b-form-group id="ip_picker_fieldset"
                              label-text-align="center"
                              description="The Hostname or IP address for the server."
                              label="Hostname / IP Address"
                              label-for="address_input">
                  <b-form-input id="address_input"
                                v-model="this.$root.api_address">
                  </b-form-input>
                </b-form-group>
                <b-form-group id="port_picker_fieldset"
                              description="The connection port. Default: 5000."
                              label="Port"
                              label-for="port_input">

                  <b-form-input id="port_input"
                                v-model="this.$root.api_port">
                  </b-form-input>
                </b-form-group>
              </b-form>
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
    document.title = "Settings | py-chain"
  },
}

</script>

<style scoped>

</style>
