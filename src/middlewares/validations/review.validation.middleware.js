import joi from 'joi';

/*리뷰용 유효성 검증 스키마*/

const reviewPostSchema = joi.object({
    title: joi.string().required().empty('')
    .messages({
      'any.required': '제목을 입력해주세요.',
    }),
    grade: joi.number().integer().required().empty('')
    .messages({
      'number.base': '등급은 숫자만 입력해주세요.',
      'any.required': '등급을 입력해주세요.',
    }),
    content: joi.string().required().empty('')
    .messages({
      'any.required': '내용을 입력해 주세요.',
    }),
    category: joi.string().required().empty('')
    .messages({
      'any.required': '카테고리를 입력해 주세요.',
    }),
});

/* 유효성 검증 미들웨어 생성 함수 */
const createValidationMiddleware = (schema) => {
    return async (req, res, next) => {
      try {
        await schema.validateAsync(req.body);
        next();
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    };
  };


  /* 각 유효성 검증 스키마에 대한 미들웨어 생성 */

  const validateReviewCreate = createValidationMiddleware(reviewPostSchema);

  export { validateReviewCreate };

