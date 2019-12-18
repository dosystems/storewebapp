import Joi from 'joi';

export default {

  // POST /api/employees/changeRecoverPassword 
  changePassword: {
    body: {
      newPassword: Joi.string().required(),
      currentPassword: Joi.string().required(),
      confirmPassword: Joi.string().required()
    }
  },

  // POST /api/employees/changeRecoverPassword 
  changeRecoverPassword: {
    body: {
      newPassword: Joi.string().required(),
      confirmPassword: Joi.string().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      email: Joi.string().required(),
      password: Joi.string().required(),
      entityType: Joi.string().required()
    }
  },

  // POST /api/employee
  createEmployee: {
    body: {
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.required()
    }
  },

  // PUT /api/employees/:employeeId
  updateEmployee: {
    body: {
      employeename: Joi.string()
    },
    params: {
      employeeId: Joi.string().hex().required()
    }
  },

  //POST  /api/categories
  createCategory: {
    body: {
      name: Joi.string().required()
    }
  },
  // PUT /api/categories/:categoryId
  updateCategory: {
    body: {
      name: Joi.string().required()
    },
    params: {
      categoryId: Joi.string().hex().required()
    }
  }

};
