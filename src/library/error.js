export function reportError(error, message) {
  // eslint-disable-next-line no-console
  console.error(error.message);
  if (
    error.name === 'UnauthorizedError' ||
    error.name === 'ForbiddenError' ||
    error.name === 'NotFoundError'
  ) {
    throw error;
  } else {
    throw new Error(message);
  }
}

export class ValidationError extends Error {
  constructor(errors) {
    super('The request is invalid.');
    this.code = 400;
    this.state = errors.reduce((result, error) => {
      if (Object.prototype.hasOwnProperty.call(result, error.key)) {
        result[error.key].push(error.message);
      } else {
        Object.defineProperty(result, error.key, {
          value: [error.message],
          enumerable: true,
        });
      }
      return result;
    }, {});
  }
}

export class UnauthorizedError extends Error {
  constructor(message) {
    super(message || 'Anonymous access is denied.');
    this.name = 'UnauthorizedError';
    this.code = 401;
  }
}

export class ForbiddenError extends Error {
  constructor(message) {
    super(message || 'Access is denied..');
    this.code = 403;
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message || 'The record does not exist.');
    this.name = 'NotFoundError';
    this.code = 404;
  }
}

function report(error) {
  console.error(error.message); //eslint-disable-line
}
export default { report };
