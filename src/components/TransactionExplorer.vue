<template>
<div>
  <b-container class="p-3 mb-3">
    <b-row>
      <b-col>
           <h1><strong>Transaction Explorer</strong></h1>
      </b-col>
    </b-row>

    <b-row class="mb-4">
    <b-col>
      <b-input-group prepend="Currency" size="lg">
        <b-form-select v-model="currency_chosen_value"
                       :disabled="api_busy"
                       :options="currency_options"
        >
        </b-form-select>
      </b-input-group>
    </b-col>
    </b-row>

    <b-row class="mt-3 mb-3">
      <b-col>
        <b-input-group prepend="Transaction Hash" size="lg">
          <b-form-input id="address-form-input"
                        v-model="address_entry"
                        placeholder="Transaction Hash"
                        type="search"
                        trim>
          </b-form-input>
          <b-input-group-append>
            <b-button :disabled="api_busy" class="btn" variant="primary" @click="address_populator(address_entry)">
              <b-spinner v-if="api_busy" small></b-spinner>
              <b-icon-search></b-icon-search>
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-col>
    </b-row>


  </b-container>
</div>
</template>

<script>
export default {
  name: "TransactionExplorer",

  mounted()
  {
    document.title = this.$route.name + this.$root.title_brand
  }
}


</script>

<style scoped>

</style>
