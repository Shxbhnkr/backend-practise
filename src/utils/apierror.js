class Apierror extends Error{
    constructor(
        statuscode,
        message="some went woonrg",
        errors={},
        stack=""

    ){
        super(message)
        this.statuscode=statuscode
        this.data=null 
        this.message=message
        this.errors=errors
        this.success=false; 

        if (stack) {
            this.stack=stack
            
        }else{
            Error.captureStackTrace (this,this.constructor)
        }
    }
    
}
export {Apierror}