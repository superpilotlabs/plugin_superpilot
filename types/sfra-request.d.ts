/**
 * TypeScript definitions for SFRA Request object
 * This wraps the global dw.system.Request object exposed via the Rhino/Java bridge
 */

declare namespace dw {
    namespace web {
        interface HttpParameterMap {
            readonly parameterNames: dw.util.Collection<string>;
            readonly requestBodyAsString: string | null;
            get(name: string): HttpParameter;
            [key: string]: any;
        }

        interface HttpParameter {
            readonly rawValue: string | null;
            readonly stringValue: string | null;
            readonly intValue: number;
            readonly doubleValue: number;
            readonly booleanValue: boolean;
            readonly submitted: boolean;
            readonly empty: boolean;
        }

        interface Headers {
            get(name: string): string | null;
            [key: string]: any;
        }
    }

    namespace util {
        interface Collection<T> {
            readonly length: number;
            iterator(): Iterator<T>;
            toArray(): T[];
        }

        interface Iterator<T> {
            hasNext(): boolean;
            next(): T;
        }

        interface Currency {
            readonly currencyCode: string;
            readonly defaultFractionDigits: number;
            readonly name: string;
            readonly symbol: string;
        }
    }

    namespace customer {
        interface Customer {
            readonly authenticated: boolean;
            readonly profile: CustomerProfile | null;
            readonly addressBook: CustomerAddressBook;
        }

        interface CustomerProfile {
            readonly lastName: string;
            readonly firstName: string;
            readonly email: string;
            readonly phoneHome: string;
            readonly customerNo: string;
            readonly credentials: CustomerCredentials;
            readonly wallet: Wallet;
        }

        interface CustomerCredentials {
            readonly login: string;
        }

        interface CustomerAddressBook {
            readonly preferredAddress: CustomerAddress | null;
            readonly addresses: CustomerAddress[];
        }

        interface CustomerAddress {
            readonly address1: string | null;
            readonly address2: string | null;
            readonly city: string | null;
            readonly companyName: string | null;
            readonly countryCode: {
                readonly displayValue: string;
                readonly value: string;
            };
            readonly firstName: string | null;
            readonly lastName: string | null;
            readonly ID: string;
            readonly phone: string | null;
            readonly postalCode: string | null;
            readonly stateCode: string | null;
            readonly postBox: string | null;
            readonly salutation: string | null;
            readonly secondName: string | null;
            readonly suffix: string | null;
            readonly suite: string | null;
            readonly title: string | null;
        }

        interface Wallet {
            readonly paymentInstruments: dw.util.Collection<CustomerPaymentInstrument>;
        }

        interface CustomerPaymentInstrument {
            readonly creditCardHolder: string;
            readonly maskedCreditCardNumber: string;
            readonly creditCardType: string;
            readonly creditCardExpirationMonth: number;
            readonly creditCardExpirationYear: number;
            readonly UUID: string;
            readonly creditCardNumber?: string;
        }
    }

    namespace system {
        interface Session {
            readonly currency: dw.util.Currency;
            readonly privacy: Record<string, any>;
            readonly clickStream: ClickStream;
            readonly custom: Record<string, any>;
            setCurrency(currency: dw.util.Currency): void;
            setTrackingAllowed(allowed: boolean): void;
        }

        interface ClickStream {
            readonly clicks: dw.util.Collection<Click>;
            readonly partial: boolean;
        }

        interface Click {
            readonly host: string;
            readonly locale: string;
            readonly path: string;
            readonly pipelineName: string;
            readonly queryString: string;
            readonly referer: string;
            readonly remoteAddress: string;
            readonly timestamp: Date;
            readonly url: string;
            readonly userAgent: string;
        }

        interface PageMetaData {
            readonly title: string;
            readonly description: string;
            readonly keywords: string;
            readonly pageMetaTags: any[];
            addPageMetaTags(pageMetaTags: any[]): void;
            setTitle(title: string): void;
            setDescription(description: string): void;
            setKeywords(keywords: string): void;
        }

        interface Geolocation {
            readonly countryCode: string;
            readonly latitude: number;
            readonly longitude: number;
        }

        /** Raw global request object from the platform */
        interface Request {
            readonly httpMethod: string;
            readonly httpHost: string;
            readonly httpPath: string;
            readonly httpHeaders: dw.web.Headers;
            readonly httpQueryString: string;
            readonly httpParameterMap: dw.web.HttpParameterMap;
            readonly includeRequest: boolean;
            readonly locale: string;
            readonly requestID: string;
            readonly geolocation: Geolocation | null;
            readonly pageMetaData: PageMetaData;
            isHttpSecure(): boolean;
            getHttpRemoteAddress(): string;
            getHttpReferer(): string;
            setLocale(localeID: string): boolean;
        }
    }
}

// ============================================================================
// SFRA Request Wrapper Types
// ============================================================================

/**
 * SimpleCache - key/value store wrapping session.privacy
 */
interface SimpleCache {
    /**
     * Gets a value from the cache
     * @param key - The key to retrieve
     */
    get(key: string): any;

    /**
     * Sets a value in the cache
     * @param key - The key to store under
     * @param value - The value to store
     */
    set(key: string, value: any): void;

    /**
     * Clears all values from the cache
     */
    clear(): void;
}

/**
 * Currency information
 */
interface CurrencyInfo {
    /** ISO 4217 currency code (e.g., "USD", "EUR") */
    readonly currencyCode: string;
    /** Default number of fraction digits */
    readonly defaultFractionDigits: number;
    /** Display name of the currency */
    readonly name: string;
    /** Currency symbol (e.g., "$", "€") */
    readonly symbol: string;
}

/**
 * Click entry from clickstream
 */
interface ClickEntry {
    readonly host: string;
    readonly locale: string;
    readonly path: string;
    readonly pipelineName: string;
    readonly queryString: string;
    readonly referer: string;
    readonly remoteAddress: string;
    readonly timestamp: Date;
    readonly url: string;
    readonly userAgent: string;
}

/**
 * Clickstream data
 */
interface ClickStream {
    /** Array of click entries */
    readonly clicks: ClickEntry[];
    /** First click in the stream */
    readonly first: ClickEntry | undefined;
    /** Last click in the stream */
    readonly last: ClickEntry | undefined;
    /** Whether the clickstream is partial */
    readonly partial: boolean;
}

/**
 * Session object exposed through the request wrapper
 */
interface SFRASession {
    /** Key/value store for session privacy data */
    readonly privacyCache: SimpleCache;
    /** Raw platform session object */
    readonly raw: dw.system.Session;
    /** Current session currency */
    readonly currency: CurrencyInfo;
    /** Clickstream data */
    readonly clickStream: ClickStream;
    /**
     * Sets the session currency
     * @param currency - Currency object to set
     */
    setCurrency(currency: dw.util.Currency): void;
}

/**
 * Address object
 */
interface AddressObject {
    readonly address1: string | null;
    readonly address2: string | null;
    readonly city: string | null;
    readonly companyName: string | null;
    readonly countryCode: {
        readonly displayValue: string;
        readonly value: string;
    };
    readonly firstName: string | null;
    readonly lastName: string | null;
    readonly ID: string;
    readonly phone: string | null;
    readonly postalCode: string | null;
    readonly stateCode: string | null;
    readonly postBox: string | null;
    readonly salutation: string | null;
    readonly secondName: string | null;
    readonly suffix: string | null;
    readonly suite: string | null;
    readonly title: string | null;
    /** Raw platform address object */
    readonly raw: dw.customer.CustomerAddress;
}

/**
 * Payment instrument object
 */
interface PaymentInstrumentObject {
    readonly creditCardHolder: string;
    readonly maskedCreditCardNumber: string;
    readonly creditCardType: string;
    readonly creditCardExpirationMonth: number;
    readonly creditCardExpirationYear: number;
    readonly UUID: string;
    readonly creditCardNumber: string | null;
    /** Raw platform payment instrument object */
    readonly raw: dw.customer.CustomerPaymentInstrument;
}

/**
 * Customer object for anonymous users
 */
interface AnonymousCustomer {
    /** Raw platform customer object */
    readonly raw: dw.customer.Customer;
}

/**
 * Customer object for unauthenticated but registered users
 */
interface UnauthenticatedCustomer {
    /** Raw platform customer object */
    readonly raw: dw.customer.Customer;
    readonly credentials: {
        readonly username: string;
    };
}

/**
 * Customer profile information
 */
interface CustomerProfile {
    readonly lastName: string;
    readonly firstName: string;
    readonly email: string;
    readonly phone: string;
    readonly customerNo: string;
}

/**
 * Customer object for authenticated users
 */
interface AuthenticatedCustomer {
    /** Raw platform customer object */
    readonly raw: dw.customer.Customer;
    /** Customer profile information */
    readonly profile: CustomerProfile;
    /** Customer address book */
    readonly addressBook: {
        readonly preferredAddress: AddressObject | null;
        readonly addresses: AddressObject[];
    };
    /** Customer wallet with payment instruments */
    readonly wallet: {
        readonly paymentInstruments: PaymentInstrumentObject[];
    };
}

/**
 * Current customer - type depends on authentication state
 */
type CurrentCustomer = AnonymousCustomer | UnauthenticatedCustomer | AuthenticatedCustomer;

/**
 * Locale information
 */
interface LocaleInfo {
    /** Locale ID (e.g., "en_US", "de_DE") */
    readonly id: string;
    /** Currency information for this locale */
    readonly currency: CurrencyInfo;
}

/**
 * Geolocation information
 */
interface GeolocationInfo {
    /** Country code */
    readonly countryCode: string;
    /** Latitude (defaults to 90.0000 if unavailable) */
    readonly latitude: number;
    /** Longitude (defaults to 0.0000 if unavailable) */
    readonly longitude: number;
}

/**
 * Page metadata object
 */
interface PageMetaDataObject {
    /** Page title */
    readonly title: string;
    /** Page description */
    readonly description: string;
    /** Page keywords */
    readonly keywords: string;
    /** Array of page meta tags */
    readonly pageMetaTags: any[];
    /**
     * Adds page meta tags
     * @param pageMetaTags - Meta tags to add
     */
    addPageMetaTags(pageMetaTags: any[]): void;
    /**
     * Sets the page title
     * @param title - Title to set
     */
    setTitle(title: string): void;
    /**
     * Sets the page description
     * @param description - Description to set
     */
    setDescription(description: string): void;
    /**
     * Sets the page keywords
     * @param keywords - Keywords to set
     */
    setKeywords(keywords: string): void;
}

/**
 * Product variant from query string (dwvar_* parameters)
 */
interface ProductVariant {
    /** Product ID */
    readonly id: string;
    /** Variant value */
    readonly value: string;
}

/**
 * Product option from query string (dwopt_* parameters)
 */
interface ProductOption {
    /** Option ID */
    readonly optionId: string;
    /** Selected value ID */
    readonly selectedValueId: string;
    /** Product ID */
    readonly productId: string;
}

/**
 * Preference value - can be simple string or range
 */
type PreferenceValue = string | {
    readonly min: string;
    readonly max: string;
};

/**
 * QueryString object - parses and serializes URL query parameters
 * Handles special SFCC parameters like dwvar_*, dwopt_*, and pref* params
 */
interface QueryString {
    /**
     * Product variant parameters (parsed from dwvar_* query params)
     * Key is the variant attribute name
     */
    variables?: Record<string, ProductVariant>;

    /**
     * Product option parameters (parsed from dwopt_* query params)
     */
    options?: ProductOption[];

    /**
     * Search refinement preferences (parsed from prefn/prefv params)
     * Key is the preference name, value is the preference value or range
     */
    preferences?: Record<string, PreferenceValue>;

    /**
     * Serializes the query string back to URL format
     */
    toString(): string;

    /**
     * All other query parameters are accessible as string properties
     * Duplicate parameters become arrays
     */
    [key: string]: string | string[] | Record<string, ProductVariant> | ProductOption[] | Record<string, PreferenceValue> | (() => string) | undefined;
}

/**
 * Form data object - normalized POST form data
 * Keys are form field names, values are the submitted values
 */
interface FormData {
    [key: string]: string;
}

/**
 * SFRA Request object - wraps the global platform request
 * This is the `req` parameter passed to controller middleware functions
 */
interface SFRARequest {
    // ========================================================================
    // Direct Properties
    // ========================================================================

    /**
     * HTTP method of the request
     * @example "GET", "POST", "PUT", "DELETE"
     */
    readonly httpMethod: string;

    /**
     * HTTP host
     * @example "www.example.com"
     */
    readonly host: string;

    /**
     * HTTP path
     * @example "/on/demandware.store/Sites-RefArchGlobal-Site/en_GB/Home-Show"
     */
    readonly path: string;

    /**
     * HTTP headers object
     */
    readonly httpHeaders: dw.web.Headers;

    /**
     * Whether the request is over HTTPS
     */
    readonly https: boolean;

    /**
     * Whether this is a remote include request
     */
    readonly includeRequest: boolean;

    // ========================================================================
    // Methods
    // ========================================================================

    /**
     * Sets the request locale
     * @param localeID - Locale identifier (e.g., "en_US")
     * @returns Result of locale setting operation
     */
    setLocale(localeID: string): boolean;

    // ========================================================================
    // Getter Properties
    // ========================================================================

    /**
     * Session object with privacy cache, currency, and clickstream
     */
    readonly session: SFRASession;

    /**
     * Raw HTTP parameter map from the platform
     */
    readonly httpParameterMap: dw.web.HttpParameterMap;

    /**
     * Parsed query string parameters
     * Includes special handling for dwvar_*, dwopt_*, and pref* parameters
     */
    readonly querystring: QueryString;

    /**
     * Normalized form data from POST requests
     * Contains key/value pairs of submitted form fields (excludes query string params)
     */
    readonly form: FormData;

    /**
     * Raw request body as string (only available for POST/PUT requests)
     */
    readonly body: string | null;

    /**
     * Geolocation information based on request IP
     */
    readonly geolocation: GeolocationInfo;

    /**
     * Current customer information
     * Structure varies based on authentication state
     */
    readonly currentCustomer: CurrentCustomer;

    /**
     * Current locale information
     */
    readonly locale: LocaleInfo;

    /**
     * Remote IP address of the request
     */
    readonly remoteAddress: string;

    /**
     * HTTP referer header value
     */
    readonly referer: string;

    /**
     * Page metadata object for setting SEO information
     */
    readonly pageMetaData: PageMetaDataObject;
}

// ============================================================================
// Global declarations
// ============================================================================

/**
 * Global request object from the platform (raw, not wrapped)
 * In SFRA controllers, you typically use the wrapped `req` parameter instead
 */
declare const request: dw.system.Request;

/**
 * Global customer object from the platform
 */
declare const customer: dw.customer.Customer;

/**
 * Global session object from the platform
 */
declare const session: dw.system.Session;

export {
    SFRARequest,
    SFRASession,
    QueryString,
    FormData,
    CurrentCustomer,
    AuthenticatedCustomer,
    UnauthenticatedCustomer,
    AnonymousCustomer,
    AddressObject,
    PaymentInstrumentObject,
    CustomerProfile,
    LocaleInfo,
    GeolocationInfo,
    PageMetaDataObject,
    CurrencyInfo,
    ClickStream,
    ClickEntry,
    SimpleCache,
    ProductVariant,
    ProductOption,
    PreferenceValue
};
