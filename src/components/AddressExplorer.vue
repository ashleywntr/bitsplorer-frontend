<template>
  <b-container>
    <b-row class="pt-3">
      <b-col>
        <h1>
          <strong>Address Explorer</strong>
        </h1>
      </b-col>
    </b-row>

    <b-row>

      <b-col md="">
        <b-row class="h-25">
          <label for="address-form-input" class="m-3">Wallet Address</label>
        </b-row>
        <b-row>
          <b-input id="address-form-input" class="m-3" placeholder="1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"></b-input>
        </b-row>
        <b-row>
          <b-button class="btn-block m-3" variant="primary">Submit</b-button>
        </b-row>
      </b-col>


      <b-col v-if="tableState==='Populated'">
        <b-table :items="addressViewTransaction" hover striped></b-table>
      </b-col>

      <b-col v-else-if="tableState==='Loading'" class="d-flex align-items-center">
        <b-spinner label="Retrieving Address Data" class="m-3">
        </b-spinner>
        <h2>Retrieving Address Data</h2>
      </b-col>

      <b-col v-else-if="tableState==='Failed'" class="d-flex align-items-center">
        <h2 class="text-danger">❌ Data retrieval failed</h2>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: "AddressExplorer",
  data() {
    return {
      addressViewTransaction: [
        {hash: "blblfbblgblkfgdfg", N_Inputs: "4", N_Outputs: "8",}
      ],
      tableState: "Failed"
    }
  },
  mounted() {
  }
}
</script>

<style scoped>

</style>
