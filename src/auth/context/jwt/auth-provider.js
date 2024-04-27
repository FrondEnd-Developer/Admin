'use client';

import PropTypes from 'prop-types';
import { useMemo, useEffect, useReducer, useCallback } from 'react';

import axios, { endpoints } from 'src/utils/axios';

import { AuthContext } from './auth-context';
import { setSession, isValidToken } from './utils';

// ----------------------------------------------------------------------
/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */
// ----------------------------------------------------------------------

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'VERIFY') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'FORGOT-PASSWORD') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'RESET-PASSWORD') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REST-LIST') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'ADD-REST') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'DELETE-REST') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);
        // const response = await axios.get(endpoints.auth.me);

        // const { user } = response.data;

        dispatch({
          type: 'INITIAL',
          payload: {
            user: {
              accessToken,
            },
          },
        });
      } else {
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      // console.error(error);
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email, password, role) => {
    const data = {
      email,
      password,
      role,
    };

    const response = await axios.post(endpoints.auth.login, data);

    const { token, user_id, user } = response.data;
    localStorage.setItem('user_id', user_id);
    setSession(token);

    dispatch({
      type: 'LOGIN',
      payload: {
        user: {
          ...user,
          token,
        },
      },
    });
    return response;
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName, phoneNumber) => {
    const data = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
    };

    const response = await axios.post(endpoints.auth.register, data);

    const { accessToken, user } = response.data;

    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user: {
          ...user,
          accessToken,
        },
      },
    });
    return response;
  }, []);

  // VERIFY
  const verify = useCallback(async (toMail, otp) => {
    const data = {
      toMail,
      otp,
    };
    const response = await axios.post(endpoints.auth.verify, data);

    // const { accessToken, user } = response.data;
    // sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'VERIFY',
      payload: {
        user: {
          // ...user,
          // accessToken,
        },
      },
    });
    return response;
  }, []);

  // FORGOT-PASSWORD
  const forgotPassword = useCallback(async (email) => {
    const data = {
      email,
    };
    const response = await axios.post(endpoints.auth.forgotPassword, data);

    const { accessToken, user } = response.data;
    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'FORGOT-PASSWORD',
      payload: {
        user: {
          ...user,
          accessToken,
        },
      },
    });
    return response;
  }, []);

  // RESET-PASSWORD
  const resetPassword = useCallback(async (newPassword, confirmPassword, email, headers) => {
    const data = {
      email,
      newPassword,
      confirmPassword,
    };

    const response = await axios.post(endpoints.auth.resetPassword, data, {
      headers,
    });

    const { accessToken, user } = response.data;
    sessionStorage.setItem(STORAGE_KEY, accessToken);

    dispatch({
      type: 'RESET-PASSWORD',
      payload: {
        user: {
          ...user,
          accessToken,
        },
      },
    });
    return response;
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);
    localStorage.clear();
    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  // ADD-REASTAURANT

  const addRest = useCallback(async (name, location, restaurant_image, contactNumber) => {
    try {
      const ownerId = localStorage.getItem('user_id');

      const formData = new FormData();
      formData.append('name', name);
      formData.append('location', location);
      formData.append('restaurant_image', restaurant_image);
      formData.append('contactNumber', contactNumber);
      formData.append('ownerId', ownerId);

      const response = await axios.post(endpoints.auth.addRest, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { accessToken } = response.data;

      sessionStorage.setItem(STORAGE_KEY, accessToken);

      // Dispatch Redux action if needed
      // dispatch({
      //   type: 'ADD-REST',
      //   payload: {
      //     user: {
      //       ...user,
      //       accessToken,
      //     },
      //   },
      // });

      return response;
    } catch (error) {
      console.error('Error occurred while adding restaurant:', error);
      throw error; // Re-throw the error for the caller to handle
    }
  }, []);

  // GET CALL TO TAKE USER DETAILS TO A LIST
  const restList = useCallback(async () => {
    try {
      const id = localStorage.getItem('user_id');
      const url = `${endpoints.auth.restList}/${id}`;
      const response = await axios.get(url);

      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }, []);

  // DELETE-RESTAURANT
  const deleteRestaurant = useCallback(async (id) => {
    try {
      const ownerId = localStorage.getItem('user_id');
      const url = `${endpoints.auth.deleteRestaurant}?id=${id}&ownerId=${ownerId}`;
      const response = await axios.delete(url);

      return response;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }, []);
  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      verify,
      forgotPassword,
      resetPassword,
      restList,
      addRest,
      deleteRestaurant,
      logout,
    }),
    [
      login,
      logout,
      register,
      verify,
      forgotPassword,
      resetPassword,
      restList,
      addRest,
      deleteRestaurant,
      state.user,
      status,
    ]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};




// -----------------------------------------------------------------------------------
