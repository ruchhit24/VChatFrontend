import { isValidUsername , isValidEmail} from "6pp";

export const usernameValidator = (username)=>{
    if(!isValidUsername(username))
     return { isVaild : false , errorMessage : "Username is Not Valid!!"}
}
export const emailValidator = (email)=>{
    if(!isValidEmail(email))
     return { isVaild : false , errorMessage : "email is Not Valid!!"}
}