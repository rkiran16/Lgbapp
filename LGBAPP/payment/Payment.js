import React from 'react';
import moment from 'moment';
import AddSubscriptionView from './Api';
import * as URL from '../actionable/Onboard';

const STRIPE_ERROR = 'Payment service error. Try again later.';
const SERVER_ERROR = 'Server error. Try again later.';
const STRIPE_PUBLISHABLE_KEY = 'pk_test_Wuq7pi9JmE6fTuy4jjQOKTqj00zQh6Oal8';

/**
 * The method sends HTTP requests to the Stripe API.
 * It's necessary to manually send the payment data
 * to Stripe because using Stripe Elements in React Native apps
 * isn't possible.
 *
 * @param creditCardData the credit card data
 * @return Promise with the Stripe data
 */
const getCreditCardToken = (creditCardData) => {
  const card = {
    'card[number]': creditCardData.values.number.replace(/ /g, ''),
    'card[exp_month]': creditCardData.values.expiry.split('/')[0],
    'card[exp_year]': creditCardData.values.expiry.split('/')[1],
    'card[cvc]': creditCardData.values.cvc,
    'card[address_zip]': creditCardData.values.postalCode,
    'card[name]': creditCardData.values.name,
    'card[currency]': 'USD'
  };

    console.log(card)
  return fetch('https://api.stripe.com/v1/tokens', {
    headers: {
      // Use the correct MIME type for your server
      Accept: 'application/json',
      // Use the correct Content Type to send data in request body
      'Content-Type': 'application/x-www-form-urlencoded',
      // Use the Stripe publishable key as Bearer
      Authorization: `Bearer ${STRIPE_PUBLISHABLE_KEY}`
    },
    // Use a proper HTTP method
    method: 'post',
    // Format the credit card data to a string of key-value pairs
    // divided by &
    body: Object.keys(card)
      .map(key => key + '=' + card[key])
      .join('&')
  }).then(response => response.json());
};

/**
 * The method imitates a request to our server.
 *
 * @param creditCardToken
 * @return {Promise<Response>}
 */
const payNow = async(creditCardToken,data,billingAddress,filterCart,rewardsapply) => {
  console.log(data.total)
  try {
    const formData = new FormData();
    formData.append('stripeToken', JSON.stringify(creditCardToken));
    formData.append('address', billingAddress);
    formData.append('tdiscount', data.tdiscount);
    formData.append('sandh', data.shipping);
    formData.append('odt', data.odt);
    formData.append('rewardsapply', rewardsapply);
    formData.append('payTotal', `${data.total}`);
    formData.append('date', filterCart[0].time);
    formData.append('parsedDate', moment(new Date()).format("ddd MMM Do, hA"));
    formData.append('details', JSON.stringify(filterCart));
    await URL.dbSubmitUrl('m/submitorders', formData);
  } catch (err) {
    throw err;
  }

};

/**
 * The main class that submits the credit card data and
 * handles the response from Stripe.
 */
export default class AddSubscription extends React.Component {
//   static navigationOptions = {
//     title: 'Subscription page',
//   };

  constructor(props) {
    super(props);
    this.state = {
      submitted: false,
      error: null
    }
  }

  // Handles submitting the payment request
  onSubmit = async (creditCardInput) => {
    const { user, billing, data, cart, rewardsapply, done  } = this.props.data;
    // Disable the Submit button after the request is sent
    this.setState({ submitted: true });
    let creditCardToken;

    try {
      // Create a credit card token
      creditCardToken = await getCreditCardToken(creditCardInput);
      if (creditCardToken.error) {
        // Reset the state if Stripe responds with an error
        // Set submitted to false to let the user subscribe again
        this.setState({ submitted: false, error: STRIPE_ERROR });
        return;
      }
    } catch (e) {
      // Reset the state if the request was sent with an error
      // Set submitted to false to let the user subscribe again
      this.setState({ submitted: false, error: STRIPE_ERROR });
      return;
    }

    // Send a request to your server with the received credit card token
    if(!billing || !billing.address){
      this.setState({ submitted: false, error: 'No address information, go to setting and add a billing address'});
      return;
    }
    const billingAddress = `${billing.address}, ${billing.city}, ${billing.state}, ${billing.zip}`;
    let filterCart = cart.map(el => {
      const disc = !el.discount? 0 : ((el.qty*el.price)*(el.discount/100));
      return ({_id:el._id, qty:el.qty, price:el.price, discount:disc, linetotal:((el.qty*el.price) - disc), time: el.time, merchant:el.creator._id})
    })
    try {
      await payNow(creditCardToken,data,billingAddress,filterCart,rewardsapply);
      this.setState({ submitted: false, error: null });
      return done('Successful');
    }catch(err){
      this.setState({ submitted: false, error: err.message });
    }
  };

  render() {
    const { user, card, billing, data, cart } = this.props.data;
    const { submitted, error } = this.state;
    return (
        <AddSubscriptionView
          error={error}
          submitted={submitted}
          onSubmit={this.onSubmit}
          card = { card }
          user = { user }
          billing = { billing }
          data = { data }
        />
    );
  }
}