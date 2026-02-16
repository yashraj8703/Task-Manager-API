const { body, validationResult } = require("express-validator");

const validateTask = [
  body("name")
    .notEmpty()
    .withMessage("Task name is required")
    .isLength({ max: 100 })
    .withMessage("Task name must be under 100 characters"),

  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be true or false"),

  // Final middleware to check errors
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    next();
  }
];

module.exports = validateTask;
