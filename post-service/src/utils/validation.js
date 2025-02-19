const joi = require('joi')

const validatePostCreate = (data) => {
    const schema = joi.object({
        content: joi.string().min(3).max(50).required(),
        mediaIds: joi.string().required(),
    });

    return schema.validate(data);
};

module.exports = validatePostCreate