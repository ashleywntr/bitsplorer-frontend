<template>
  <b-container>
    <b-row class="pt-3">
      <b-col>
        <h1><strong>Home</strong></h1>
      </b-col>
    </b-row>

    <b-row class="m-1">
      <p>Welcome to py-chain! The Bitcoin Blockchain explorer.</p>
    </b-row>

  </b-container>
</template>

<script>
export default {
name: "Home",
  mounted(){
    document.title = "Home | py-chain"
  }
}

</script>

<style scoped>

</style>
