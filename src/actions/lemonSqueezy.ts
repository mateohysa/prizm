import { onAuthenticateUser } from "./user"
import lemonSqueezyClient from "@/lib/axios"

export const buySubscription = async (buyUserId: string) => {
    try{
        const checkUser = await onAuthenticateUser()
        if(checkUser.status !== 200 || !checkUser.user){
            return {status: 403, error: "User not authenticated"}
        }

        const res = await lemonSqueezyClient(process.env.LEMON_SQUEEZY_API_KEY).post("/checkouts", {
            data: {
                type: "checkouts",
                attributes: {
                    checkout_data: {
                        custom:{
                            buyUserId: buyUserId,
                        }
                    },
                    product_options:{
                        redirect_url: `${process.env.NEXT_PUBLIC_HOST_URL}/dashboard`,
                    }
                },
                relationships: {
                    store:{
                        data:{
                            type: "stores",
                            id: process.env.LEMON_SQUEEZY_STORE_ID,
                        }
                    },
                    variant:{
                        data:{
                            type: "variants",
                            id: process.env.LEMON_SQUEEZY_VARIANT_ID,
                        }
                    }
                }
            }
        })

        const checkoutURL = res.data.data.attributes.url
        return {status: 200, url:checkoutURL}
    }
    catch(error){
        console.error("❌ ERROR:", error)
        return {status: 500, error: "Internal server error"}
    }
}