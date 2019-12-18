import Promise from 'bluebird';
import mongoose from 'mongoose';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import crypto from 'crypto';
const Schema = mongoose.Schema;

/**
 * Employee Schema
 */
const EmployeeSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  middleName: {
    type: String
  },
  lastName: {
    type: String
  },
  displayName: {
    type: String
  },
  role: {
    type: String
  },
  isFirstTimeLogged:{
    type: Boolean,
    default: true
  },
  password: {
    type: String
  },
  salt: {
    type: String
  },
  photo: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  gender: {
    type: String
  },
  email: {
    type: String
  },
  address: {
    address: {
      type: String
    },
    street: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    zip: {
      type: String
    }
  },
  status: {
    type: String
  },
  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date
  },
  createdBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    name: {
      type: String
    }
  },
  updatedBy: {
    employee: {
      type: Schema.ObjectId,
      ref: 'Employee'
    },
    name: {
      type: String
    }
  },
  active: {
    type: Boolean,
    default: true
  }
});

/**
 * Hook a pre save method to hash the password
 */
EmployeeSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }

  next();
});

/**
 * Hook a pre validate method to test the local password
 */
EmployeeSchema.pre('validate', function (next) {
  if (this.provider === 'local' && this.password && this.isModified('password')) {
    let result = owasp.test(this.password);
    if (result.errors.length) {
      let error = result.errors.join(' ');
      this.invalidate('password', error);
    }
  }

  next();
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
EmployeeSchema.methods = {
  /**
  * Create instance method for authenticating employee
  * @param {password}
  */
  authenticate(password) {
    return this.password === this.hashPassword(password);
  },

  /**
  * Create instance method for hashing a password
  * @param {password}
  */
  hashPassword(password) {
    if (this.salt && password) {
      return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
    } else {
      return password;
    };
  }
};

/**
 * Statics
 */
EmployeeSchema.statics = {
  /**
   * save and update employee
   * @param employee
   * @returns {Promise<Employee, APIError>}
   */
  save(employee) {
    return employee.save()
      .then((employee) => {
        if (employee) {
          return employee;
        };
        const err = new APIError('Error in employee', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * Get employee
   * @param {ObjectId} id - The objectId of employee.
   * @returns {Promise<Employee, APIError>}
   */
  get(id) {
    return this.findById(id)
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .exec()
      .then((employee) => {
        if (employee) {
          return employee;
        };
        const err = new APIError('No such employee exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List employee in descending order of 'createdAt' timestamp.
   * @returns {Promise<Employee[]>}
   */
  list(query) {
    return this.find(query.filter, '-salt -password')
      .populate('createdBy.employee', 'displayName')
      .populate('updatedBy.employee', 'displayName')
      .sort(query.sorting)
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .exec();
  },

  /**
   * Count of employee records
   * @returns {Promise<Employee[]>}
   */
  totalCount(query) {
    return this.find(query.filter)
      .count();
  },

  /**
   * Find unique email.
   * @param {string} email.
   * @returns {Promise<Employee[]>}
   */
  findUniqueEmail(email) {
    email = email.toLowerCase();
    return this.findOne({
      email: email,
      active: true
    })
      .exec()
      .then((employee) => employee);
  },
};

/**
 * @typedef Employee
 */
export default mongoose.model('Employee', EmployeeSchema);
