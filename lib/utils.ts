import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import qs from 'query-string';

import { UrlQueryParams, RemoveUrlQueryParams } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Error types for better categorization
export enum ErrorType {
  DATABASE = 'DATABASE_ERROR',
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTH_ERROR',
  PAYMENT = 'PAYMENT_ERROR',
  NETWORK = 'NETWORK_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

interface ErrorResponse {
  message: string;
  type: ErrorType;
  code?: string;
  details?: unknown;
}

export const handleError = (error: unknown): ErrorResponse => {
  console.error('Error occurred:', error);

  // Default error response
  let errorResponse: ErrorResponse = {
    message: 'An unexpected error occurred',
    type: ErrorType.UNKNOWN,
  };

  if (error instanceof Error) {
    // Handle mongoose errors
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      errorResponse = {
        message: 'Database operation failed',
        type: ErrorType.DATABASE,
        details: error.message
      };
    }
    // Handle validation errors
    else if (error.name === 'ValidationError') {
      errorResponse = {
        message: 'Invalid input data',
        type: ErrorType.VALIDATION,
        details: error.message
      };
    }
    // Handle authentication errors
    else if (error.name === 'UnauthorizedError' || error.name === 'JsonWebTokenError') {
      errorResponse = {
        message: 'Authentication failed',
        type: ErrorType.AUTHENTICATION,
        details: error.message
      };
    }
    // Handle Stripe errors
    else if (error.name === 'StripeError') {
      errorResponse = {
        message: 'Payment processing failed',
        type: ErrorType.PAYMENT,
        details: error.message
      };
    }
    else {
      errorResponse = {
        message: error.message,
        type: ErrorType.UNKNOWN,
        details: error.stack
      };
    }
  } else if (typeof error === 'string') {
    errorResponse = {
      message: error,
      type: ErrorType.UNKNOWN
    };
  }

  // In production, you would send this to an error monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error monitoring service like Sentry
    // sendToErrorMonitoring(errorResponse);
  }

  return errorResponse;
};

export const formatDateTime = (dateString: string) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // Mon
    month: 'short', // Aug
    day: 'numeric', // 16
    hour: 'numeric', // 7
    minute: '2-digit', // 30
    hour12: true, // PM
  }

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // Mon
    month: 'short', // Aug
    day: 'numeric', // 16
    year: 'numeric', // 2023
  }

  const date = new Date(dateString)

  const formattedDateTime = date.toLocaleString('en-US', dateTimeOptions)
  const formattedDate = date.toLocaleString('en-US', dateOptions)

  return {
    dateTime: formattedDateTime,
    date: formattedDate,
  }
}

export const formatPrice = (price: string) => {
  const amount = parseFloat(price)
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)

  return formattedPrice
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file)

export function generatePagination(currentPage: number, totalPages: number) {
  // If the total number of pages is 7 or less,
  // display all pages without any ellipsis
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  // If the current page is among the first 3 pages,
  // show the first 3, an ellipsis, and the last 2 pages
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages - 1, totalPages]
  }

  // If the current page is among the last 3 pages,
  // show the first 2, an ellipsis, and the last 3 pages
  if (currentPage >= totalPages - 2) {
    return [1, 2, '...', totalPages - 2, totalPages - 1, totalPages]
  }

  // If the current page is somewhere in the middle,
  // show the first page, an ellipsis, the current page and its neighbors,
  // another ellipsis, and the last page
  return [
    1,
    '...',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    '...',
    totalPages,
  ]
}

export function constructUrl(path: string, params: URLSearchParams) {
  const trimmedPath = path.endsWith('/') ? path.slice(0, -1) : path;
  const hasParams = params.toString();

  if (!hasParams) return trimmedPath;

  return `${trimmedPath}?${params.toString()}`;
}

export function addQueryParams({ params, key, value }: UrlQueryParams) {
  const currentUrl = qs.parse(params);

  currentUrl[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}

export function removeKeysFromQuery({ params, keysToRemove }: RemoveUrlQueryParams) {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  });

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query: currentUrl,
    },
    { skipNull: true }
  );
}
