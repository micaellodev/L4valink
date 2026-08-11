import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

interface ErrorResponse {
    statusCode: number;
    message: string;
    error?: string;
    timestamp: string;
    path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const path = httpAdapter.getRequestUrl(request) as string;

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message =
            exception instanceof HttpException
                ? (exception.getResponse() as { message?: string | string[] }).message || exception.message
                : 'Internal server error';

        const normalizedMessage = Array.isArray(message) ? message.join(', ') : message;

        const responseBody: ErrorResponse = {
            statusCode: httpStatus,
            message: normalizedMessage,
            error: httpStatus >= 500 ? 'Internal Server Error' : 'Client Error',
            timestamp: new Date().toISOString(),
            path,
        };

        if (httpStatus >= 500) {
            this.logger.error(
                `${request.method} ${path} - ${httpStatus}: ${normalizedMessage}`,
                exception instanceof Error ? exception.stack : undefined,
            );
        } else {
            this.logger.warn(`${request.method} ${path} - ${httpStatus}: ${normalizedMessage}`);
        }

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
