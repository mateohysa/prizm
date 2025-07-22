import { onAuthenticateUser } from "./user"

export const buySubscription = async (buyUserId: string) => {
    try{
        const checkUser = await onAuthenticateUser()
        if(checkUser.status !== 200 || !checkUser.user){
            return {status: 403, error: "User not authenticated"}
        }
    }
    catch(error){
        console.error("❌ ERROR:", error)
    }
}