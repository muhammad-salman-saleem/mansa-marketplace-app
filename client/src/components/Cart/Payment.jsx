import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useStripe, useElements } from '@stripe/react-stripe-js';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import {
  // CardNumberElement,
  // CardCvcElement,
  // CardExpiryElement,
  CardElement
} from '@stripe/react-stripe-js';
import { clearErrors, newOrder } from '../../actions/orderAction';
import { emptyCart } from '../../actions/cartAction';
import { post } from '../../utils/paytmForm';
import Stepper from './Stepper';
import PriceSidebar from './PriceSidebar';
import MetaData from '../Layouts/MetaData';

const Payment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const stripe = useStripe();
  const elements = useElements();
  const [payDisable, setPayDisable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('stripe');
  const { shippingInfo, cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const { error } = useSelector((state) => state.newOrder);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item?.price * item?.quantity,
    0
  );
  const paymentData = {
    amount: Math.round(totalPrice),
    email: user?.email,
    phoneNo: shippingInfo?.phoneNo,
  };


  const SubmitStripePayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setPayDisable(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/v1/payment/processStripe',
        paymentData,
        config
      );

    

      if (!data.success) {
        console.error('Error creating payment intent:', data.error);
        setLoading(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);
      const client_secret = data?.client_secret;

      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: user?.name,
            email: user?.email,
            phone: shippingInfo?.phoneNo,
            address: {
              line1: shippingInfo?.address,
              city: shippingInfo?.city,
              country: shippingInfo?.country,
              state: shippingInfo?.state,
              postal_code: shippingInfo?.pincode,
            },
          },
        },
      });

      if (result?.error) {
        console.error('Payment error:', result.error);
        enqueueSnackbar(result.error.message, { variant: 'error' });
      } else {
        if (result.paymentIntent?.status === 'succeeded') {
          const order = {
            shippingInfo,
            orderItems: cartItems,
            totalPrice,
            paymentInfo: {
              id: result?.paymentIntent?.id,
              status: result?.paymentIntent?.status,
            },
          };
          dispatch(newOrder(order));
          dispatch(emptyCart());
          navigate('/orders/success');
        } else {
          enqueueSnackbar('Processing Payment Failed!', { variant: 'error' });
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPayDisable(false);
      enqueueSnackbar('An error occurred during payment.', { variant: 'error' });
    }
  };

  const SubmitPaytmPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPayDisable(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post('/api/v1/payment/processPaytm', paymentData, config);

      let info = {
        action: 'https://securegw-stage.paytm.in/order/process',
        params: data?.paytmParams,
      };

      post(info);
      if (!data?.success) {
        console.error('Error creating payment intent:', data.error);
        setLoading(false);
        return;
      }else if(data?.success) {
        dispatch(emptyCart());
        navigate('/orders/success');
      }else {
        enqueueSnackbar('Processing Payment Failed!', { variant: 'error' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPayDisable(false);
      enqueueSnackbar('An error occurred during payment.', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (error) {
      dispatch(clearErrors());
      const errorMessage = typeof error === 'string' ? error : 'An error occurred';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  }, [dispatch, error, enqueueSnackbar]);

  return (
    <>
      <MetaData title="AtEMkart: Secure Payment | Paytm" />
      <main className="w-full mt-20">
        <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">
          <div className="flex-1">
            <Stepper activeStep={3}>
              <div className="w-full bg-white">
                <div className="flex flex-col justify-between  gap-2 w-full px-4 md:px-8  my-4 overflow-hidden">
                  <FormControl>
                    <RadioGroup aria-labelledby="payment-radio-group" value={selectedPaymentMethod} onChange={(e) => setSelectedPaymentMethod(e.target.value)} name="payment-radio-button">
                      <FormControlLabel
                        value="stripe"
                        control={<Radio />}
                        label={
                          <div className="flex items-center gap-4">
                            <img draggable="false" className="h-6 w-6 object-contain" src="https://km.visamiddleeast.com/dam/VCOM/regional/ap/taiwan/global-elements/images/tw-visa-platinum-card-498x280.png" alt="Card Logo" />
                            <span>Card</span>
                          </div>
                        }
                      />
                      <FormControlLabel
                        value="paytm"
                        control={<Radio />}
                        label={
                          <div className="flex items-center gap-4">
                            <img draggable="false" className="h-6 w-6 object-contain" src="https://rukminim1.flixcart.com/www/96/96/promos/01/09/2020/a07396d4-0543-4b19-8406-b9fcbf5fd735.png" alt="Paytm Logo" />
                            <span>Paytm</span>
                          </div>
                        }
                      />
                    </RadioGroup>
                  </FormControl>
                </div>
                {selectedPaymentMethod === 'paytm' && (
                  <form onSubmit={(e) => SubmitPaytmPayment(e)} autoComplete="off" className="flex flex-col justify-start gap-2 w-full mx-8 my-4 overflow-hidden">
                    <input
                      type="submit"
                      value={loading ? 'Processing...' : `Paytm Pay ₹${totalPrice.toLocaleString()}`}
                      disabled={payDisable}
                      className={`bg-${payDisable ? 'primary-grey cursor-not-allowed' : 'primary-orange cursor-pointer'} w-3/4 sm:w-1/2 lg:w-2/6 my-2 py-3 font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none`}
                    />
                  </form>
                )}
                {selectedPaymentMethod === 'stripe' && (
                  <form onSubmit={(e) => SubmitStripePayment(e)} autoComplete="off" className="flex flex-col justify-start gap-3 w-[90%] sm:w-3/4 mx-4 md:mx-8 my-4">
                    <div className="border p-4 rounded-lg ">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '18px',
                              color: '#424770',
                              '::placeholder': {
                                color: '#aab7c4',
                              },
                            },
                            invalid: {
                              color: '#9e2146',
                            },
                          },
                          hidePostalCode: true,
                        }}
                      />
                    </div>

                    <input
                      type="submit"
                      value={loading ? 'Processing...' : `Card Pay ₹${totalPrice.toLocaleString()}`}
                      disabled={payDisable}
                      className={`bg-${payDisable ? 'primary-grey cursor-not-allowed' : 'primary-orange cursor-pointer'} w-3/4 sm:w-[70%] lg:w-2/5 my-2 py-3.5 text-sm font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none cursor-pointer`}
                    />
                  </form>
                )}
              </div>
            </Stepper>
          </div>
          <PriceSidebar cartItems={cartItems} />
        </div>
      </main>
    </>
  );
};

export default Payment;
