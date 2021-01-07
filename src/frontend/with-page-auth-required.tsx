import React, { ComponentType, useEffect } from 'react';
import { useRouter } from 'next/router';

import { useUser } from './use-user';

/**
 * @ignore
 */
const defaultOnRedirecting = (): JSX.Element => <></>;

/**
 * @ignore
 */
const defaultOnError = (): JSX.Element => <></>;

/**
 * Options for the withPageAuthRequired Higher Order Component
 *
 * @category Client
 */
export interface WithPageAuthRequiredOptions {
  /**
   * ```js
   * withPageAuthRequired(Profile, {
   *   returnTo: '/profile'
   * });
   * ```
   *
   * Add a path to return the user to after login.
   */
  returnTo?: string;
  /**
   * ```js
   * withPageAuthRequired(Profile, {
   *   loginUrl: '/api/login'
   * });
   * ```
   * The path of your custom login API route.
   */
  loginUrl?: string;
  /**
   * ```js
   * withPageAuthRequired(Profile, {
   *   onRedirecting: () => <div>Redirecting you to the login...</div>
   * });
   * ```
   *
   * Render a message to show that the user is being redirected to the login.
   */
  onRedirecting?: () => JSX.Element;
  /**
   * ```js
   * withPageAuthRequired(Profile, {
   *   onError: error => <div>Error: {error.message}</div>
   * });
   * ```
   *
   * Render a fallback in case of error fetching the user from the profile API route.
   */
  onError?: (error: Error) => JSX.Element;
}

/**
 * ```js
 * const MyProtectedPage = withPageAuthRequired(MyPage);
 * ```
 *
 * When you wrap your pages in this Higher Order Component and an anonymous user visits your page
 * they will be redirected to the login page and then returned to the page they were redirected from (after login).
 *
 * @category Client
 */
export type WithPageAuthRequired = <P extends object>(
  Component: ComponentType<P>,
  options?: WithPageAuthRequiredOptions
) => React.FC<P>;

/**
 * @ignore
 */
const withPageAuthRequired: WithPageAuthRequired = (Component, options = {}) => {
  return function withPageAuthRequired(props): JSX.Element {
    const router = useRouter();
    const {
      returnTo = router.asPath,
      onRedirecting = defaultOnRedirecting,
      onError = defaultOnError,
      loginUrl = '/api/auth/login'
    } = options;
    const { user, error, isLoading } = useUser();

    useEffect(() => {
      if ((user && !error) || isLoading) return;

      (async (): Promise<void> => {
        await router.push(`${loginUrl}?returnTo=${returnTo}`);
      })();
    }, [user, error, isLoading]);

    if (error) return onError(error);
    if (user) return <Component {...props} />;

    return onRedirecting();
  };
};

export default withPageAuthRequired;
