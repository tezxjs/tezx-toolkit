import { Context, Middleware } from 'tezx';

/**
 * Schema adapter interface.
 * Any schema library (Zod, Joi, AJV, etc.) can implement this.
 */
type SchemaAdapter = {
    /**
     * Validates input data and returns the validated value or throws an error.
     * @param data - Input data to validate
     * @returns Validated data or a Promise resolving to validated data
     */
    validate: (data: any) => any | Promise<any>;
};
/**
 * Options for the `validate` middleware.
 */
interface ValidateOptions<TOutput> {
    /**
     * Schema adapter to use for validation.
     */
    adapter: SchemaAdapter;
    /**
     * Optional error handler for validation errors.
     * @param err - Error instance
     * @param ctx - Current request context
     * @returns Response or a Promise resolving to Response
     */
    onError?: (err: Error, ctx: Context) => Response | Promise<Response>;
    /**
     * Source of data to validate. Default is `"body"`.
     */
    source?: "body" | "query" | "params";
    /**
     * Optional transformer to modify the validated data before assigning to ctx.validated.
     * @param data - Validated data from schema adapter
     * @returns Transformed data or a Promise resolving to transformed data
     */
    transform?: (data: TOutput) => any | Promise<any>;
    /**
     * Parser method for body input. Default is `"json"`.
     */
    parseBody?: "json" | "text" | "formData";
}
/**
 * Middleware for validating request data using a schema adapter.
 * Sets the validated (and optionally transformed) data on `ctx.validated`.
 *
 * @template TOutput - Type returned by schema adapter validation
 * @template T - Context state type (optional)
 * @template Path - Route path type (optional)
 *
 * @param options - Validation options including adapter, source, transform, and parseBody
 * @returns Middleware function
 *
 * @example
 * ```ts
 * import { validate, SchemaAdapter } from "tezx-validate";
 * import { z } from "zod";
 *
 * const userSchema: SchemaAdapter = {
 *   validate: async (data) => z.object({
 *     username: z.string().min(3),
 *     password: z.string().min(6)
 *   }).parseAsync(data)
 * }
 *
 * app.use("/login", validate({ adapter: userSchema }), (ctx) => {
 *   // ctx.validated contains validated data
 *   ctx.json({ success: true, user: ctx.validated });
 * });
 * ```
 */
declare function validate<TOutput, T extends Record<string, any> = {}, Path extends string = any>({ onError, adapter, transform, parseBody, source }: ValidateOptions<TOutput>): Middleware<T, Path>;
declare module "tezx" {
    interface BaseContext<TPath extends string = any> {
        /**
         * Contains validated data after passing through `validate` middleware.
         */
        validated: any;
    }
}

export { validate };
export type { SchemaAdapter, ValidateOptions };
