export default class BaseResponse<T> {
  isSuccess: boolean;
  code: number;
  timestamp: Date;
  result: T;

  constructor(code: number, result: T) {
    this.code = code;
    this.result = result;
    this.timestamp = new Date();
    this.isSuccess = code === 200 || code === 201;
  }
}
