const USD_formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
})

export default {
    methods: {
        currency_formatter: function (input, key, item, toFixed = 2) {
            if (this.currency_chosen_value === 'XBP') {
                if ((input / 100000000).toFixed(2) > 0) {
                    return '₿' + ((input / 100000000).toFixed(toFixed)).toLocaleString('en-GB')
                } else {
                    return '₿' + ((input / 100000000).toFixed(6)).toLocaleString('en-GB')
                }
            } else {
                let sat_to_btc = input / 100000000

                let initial_date_string = ''

                if (this.blockday_selected) {
                    initial_date_string = this.blockday_selected_date
                } else {
                    initial_date_string = item._id
                }
                let retrieval_date_string = initial_date_string.slice(4) + '-' + initial_date_string.slice(2, 4) + '-' + initial_date_string.slice(0, 2)

                let usd_value = this.currency_data[retrieval_date_string]['USD']
                let USD_value = (sat_to_btc * usd_value)
                let USD_fixed_value = 0

                if (USD_value.toFixed(toFixed) > 0) {
                    USD_fixed_value = USD_value.toFixed(toFixed)
                } else {
                    USD_fixed_value = USD_value.toFixed(6)
                }
                return USD_formatter.format(USD_fixed_value)
            }
        }
    }
}
