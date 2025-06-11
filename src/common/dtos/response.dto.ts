class ResponseDto {
    private success: boolean;
    private statusCode: number;
    private message: string;
    private data: any;
    private headers?: Record<string, string>;

    constructor(success: boolean = false, statusCode: number = 500, message: string = '', data: any = {}) {
        this.success = success;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }

    getSuccess() {
        return this.success;
    }

    getStatusCode() {
        return this.statusCode;
    }
    getMessage() {
        return this.message;
    }
    getData() {
        return this.data;
    }

    getHeaders() {
        return this.headers;
    }

    setSuccess(success: boolean) {
        this.success = success;
    }

    setStatusCode(statusCode: number) {
        this.statusCode = statusCode;
    }
    setMessage(message: string) {
        this.message = message;
    }

    setData(data: any) {
        this.data = data;
    }

    setHeaders(headers: Record<string, string>) {
        this.headers = headers;
    }

    toJSON() {
        return {
            success: this.success,
            statusCode: this.statusCode,
            message: this.message,
            data: this.data
        }
    }
}

export default ResponseDto;