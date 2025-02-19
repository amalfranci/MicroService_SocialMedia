const joi = require('joi')

const validateRegisteration = (data) => {
    const schema = joi.object({
        username: joi.string().min(3).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    });

    return schema.validate(data);
};

const validateUserLogin = (data)=>{
    const schema = joi.object({

        email: joi.string().email().required(),
        password:joi.string().min(6).required()
    });
    return schema.validate(data)
}

module.exports = {validateRegisteration,validateUserLogin}