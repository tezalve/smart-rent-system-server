const axios = require('axios')
const paymentModel = require('../model/paymentModel')
const bookedpropertyModel = require('../model/bookedpropertyModel')
const globals = require('node-global-storage')
const { v4: uuidv4 } = require('uuid')
const { ObjectId } = require('mongodb');
class paymentController {

    bkash_headers = async () => {
        return {
            "Content-Type": "application/json",
            Accept: "application/json",
            authorization: globals.getValue('id_token'),
            'x-app-key': process.env.bkash_api_key,
        }
    }

    payment_create = async (req, res) => {
        const { amount, userId, bookingId } = req.body
        globals.setValue('userId', userId)
        globals.setValue('bookingId', bookingId)
        try {
            const { data } = await axios.post(process.env.bkash_create_payment_url, {
                mode: '0011',
                payerReference: " ",
                callbackURL: 'http://localhost:5000/api/bkash/payment/callback',
                amount: amount,
                currency: "BDT",
                intent: 'sale',
                merchantInvoiceNumber: 'Inv' + uuidv4().substring(0, 5)
            }, {
                headers: await this.bkash_headers()
            })
            return res.status(200).json({ bkashURL: data.bkashURL })
        } catch (error) {
            return res.status(401).json({ error: error.message })
        }
    }

    call_back = async (req, res) => {
        const { paymentID, status } = req.query

        if (status === 'cancel' || status === 'failure') {
            return res.redirect(`http://localhost:5173/dashboard/bookedproperties`)
            console.log(status);
        }
        if (status === 'success') {
            try {
                const { data } = await axios.post(process.env.bkash_execute_payment_url, { paymentID }, {
                    headers: await this.bkash_headers()
                })
                if (data && data.statusCode === '0000') {
                    const userId = globals.getValue('userId');
                    const bookingId = globals.getValue('bookingId');
                    const paymentData = {
                        userId: userId,
                        paymentID: paymentID,
                        trxID: data.trxID,
                        date: data.paymentExecuteTime,
                        amount: parseFloat(data.amount),
                    };

                    await paymentModel.create(paymentData); // This will save to the 'payments' collection
                    await bookedpropertyModel.updateOne(
                        { _id: new ObjectId(bookingId) }, // Find the user by ID (or use any criteria relevant to your application)
                        { payment_done: true } // update 
                    );
                    return res.redirect(`http://localhost:5173/dashboard/bookedproperties`);
                }else{
                    // return res.redirect(`http://localhost:5173/`)
                    console.log(data.statusMessage);
                }
            } catch (error) {
                console.log(error)
                // return res.redirect(`http://localhost:5173/error?message=${error.message}`)
                console.log(error.message);
            }
        }
    }

    // refund = async(req,res)=>{
    //     const {trxID} = req.params;

    //     try {
    //         const payment = await paymentModel.findOne({trxID})

    //         const {data} = await axios.post(process.env.bkash_refund_transaction_url,{
    //             paymentID : payment.paymentID,
    //             amount : payment.amount,
    //             trxID,
    //             sku : 'payment',
    //             reason : 'cashback'
    //         },{
    //             headers: await this.bkash_headers()
    //         })
    //         if (data && data.statusCode === '0000') {
    //             return res.status(200).json({message : 'refund success'})
    //         }else{
    //             return res.status(404).json({error : 'refund failed'})
    //         }
    //     } catch (error) {
    //         return res.status(404).json({error : 'refund failed'})
    //     }
    // }
}

module.exports = new paymentController()