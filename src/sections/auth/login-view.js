'use client';

import * as Yup from 'yup';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import CustomAlert from 'src/layouts/common/custom-alert';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

const jwt = require('jsonwebtoken');

const roles = [
  {
    value: 'admin',
    label: 'Admin',
  },
  {
    value: 'sub-admin',
    label: 'Sub-Admin',
  },
];

export default function JwtLoginView() {
  const { login } = useAuthContext();

  const childFunctionRef = useRef(null);

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
    role: Yup.string().required('Role is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
    role: 'admin',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await login?.(data.email, data.password, data.role);
      jwt.verify(result.data.token, process.env.NEXT_JWT_SECRET, (err, decoded) => {});

      if (result.status === 200) {
        if (childFunctionRef.current) {
          childFunctionRef.current('Login Successful', 'success');
        }
      }
      setTimeout(() => {
        const metadata = { email: data.email };
        const queryString = new URLSearchParams(metadata).toString();
        router.push(`${PATH_AFTER_LOGIN}?${queryString}`);
      }, 3000);
    } catch (error) {
      console.error(error);
      if (childFunctionRef.current) {
        console.error('status', childFunctionRef.current);
        childFunctionRef.current(`${error.detail}`, 'error');
      }
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });

  const renderHead = (
    <Stack spacing={2} sx={{ mb: 5 }}>
      <Typography variant="h4">Sign in to Minimal</Typography>

      <Stack direction="row" spacing={0.5}>
        <Typography variant="body2">New user?</Typography>

        <Link component={RouterLink} href={paths.auth.register} variant="subtitle2">
          Create an account
        </Link>
      </Stack>
    </Stack>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField name="email" label="Email address" />

      <RHFTextField
        name="password"
        label="Password"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <RHFTextField
        id="outlined-select-currency"
        select
        name="role"
        label="Role"
        defaultValue="admin"
      >
        {roles.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </RHFTextField>

      <Link
        variant="body2"
        href={paths.auth.forgotPassword}
        color="inherit"
        underline="always"
        sx={{ alignSelf: 'flex-end' }}
      >
        Forgot password?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Login
      </LoadingButton>
    </Stack>
  );

  return (
    <>
      {/* Pass childFunctionRef.current as a function to CustomAlert */}
      <CustomAlert childFunctionRef={childFunctionRef} message="Test Registration" type="success" />

      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </>
  );
}
