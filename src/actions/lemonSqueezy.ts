import { onAuthenticateUser } from "./user"
import lemonSqueezyClient from "@/lib/axios"

/**
 * Create subscription checkout via Lemon Squeezy API
 * 1. Authenticate user to ensure authorized access
 * 2. Build checkout payload with user ID, store, and variant data
 * 3. Send POST request to Lemon Squeezy checkouts endpoint
 * 4. Extract checkout URL from API response
 * 5. Return checkout URL for user redirection or error
 */
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